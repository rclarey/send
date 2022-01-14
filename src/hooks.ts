import { useEffect, useMemo, useState } from "react";

import { decode } from "./base64";
import { speed } from "./speedometer";
import { humanFileSize } from "./utils";

const oneDay = 60 * 60 * 24;

async function get(endpoint: string, params: Record<string, string> = {}) {
  const search = new URLSearchParams(params).toString();
  const r = await fetch(`https://api.gofile.io/${endpoint}?${search}`);
  const json = await r.json();
  return json.data;
}

async function put(endpoint: string, data: Record<string, string>) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(data)) {
    formData.set(key, value);
  }
  const r = await fetch(`https://api.gofile.io/${endpoint}`, {
    method: "PUT",
    body: formData,
  });
  const json = await r.json();
  return json.data;
}

async function getAccount(): Promise<{ token: string; rootFolder: string }> {
  const { token } = await get("createAccount");
  const { rootFolder } = await get("getAccountDetails", { token });
  await put("setFolderOption", {
    token,
    folderId: rootFolder,
    option: "public",
    value: "true",
  });

  return { token, rootFolder };
}

async function getServer() {
  const { server } = await get("getServer");
  return server as string;
}

function getSymmetricKey() {
  return crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt"],
  );
}

export interface UploadResult {
  fileId: string;
  fileName: string;
  iv: Uint8Array;
}

export type UploadProgress =
  | { type: "wait" }
  | { type: "enc" }
  | { type: "up"; percent: number }
  | { type: "fail" }
  | { type: "done" };

export function useUpload() {
  const p = useMemo(
    () => Promise.all([getAccount(), getSymmetricKey(), getServer()]),
    [],
  );

  return {
    p,
    upload: async (file: File, onProgress: (p: UploadProgress) => void) => {
      const [{ token, rootFolder }, key, server] = await p;

      onProgress({ type: "enc" });

      const data = await file.arrayBuffer();
      const iv = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(rootFolder + file.name),
      );
      const encData = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        data,
      );

      onProgress({ type: "up", percent: 0 });

      const body = new FormData();
      body.set("file", new File([encData], file.name));
      body.set("token", token);
      body.set("folderId", rootFolder);
      body.set("expire", String(Math.floor(Date.now() / 1000) + oneDay));

      return new Promise<UploadResult>((resolve, reject) => {
        const req = new XMLHttpRequest();
        req.responseType = "json";
        req.upload.onprogress = (e) =>
          onProgress({ type: "up", percent: e.loaded / e.total });
        req.onload = () => {
          if (req.response?.data?.fileId && req.response?.data?.fileName) {
            onProgress({ type: "done" });
            resolve({
              fileId: req.response.data.fileId,
              fileName: req.response.data.fileName,
              iv: new Uint8Array(iv),
            });
          } else {
            onProgress({ type: "fail" });
            reject();
          }
        };
        req.onerror = () => {
          onProgress({ type: "fail" });
          reject();
        };
        req.open("POST", `https://${server}.gofile.io/uploadFile`, true);
        req.send(body);
      });
    },
  };
}

export type DownloadProgress =
  | { type: "wait" }
  | { type: "down"; percent: number }
  | { type: "dec" }
  | { type: "fail" }
  | { type: "done" };

async function importKey(strKey?: string) {
  if (!strKey) {
    throw new Error();
  }
  return crypto.subtle.importKey(
    "raw",
    decode(strKey),
    { name: "AES-GCM" },
    true,
    ["decrypt"],
  );
}

interface FileInfo {
  id: string;
  name: string;
  size: number;
  directLink: string;
}

interface Contents {
  [key: string]: FileInfo & { type: string };
}

export type UseFilesResult =
  | { state: "fail"; files: null }
  | { state: "wait"; files: null }
  | { state: "done"; files: FileInfo[] };

export function useFiles(token?: string, folderId?: string): UseFilesResult {
  const [files, setFiles] = useState<FileInfo[] | null>(null);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      if (!token || !folderId) {
        return;
      }

      try {
        const { contents } = await get("getContent", {
          token,
          contentId: folderId,
          websiteToken: "websiteToken",
          cache: "true",
        }) as { contents: Contents };

        const files = Object.values(contents).filter((x) => x.type === "file");
        if (files.length === 0) {
          setError(true);
        } else {
          setFiles(files);
        }
      } catch {
        setError(true);
      }
    })();
  }, []);

  if (error) {
    return { files: null, state: "fail" };
  }

  if (!files) {
    return { files: null, state: "wait" };
  }

  return { files, state: "done" };
}

export function useDownload(strKey?: string, token?: string, folder?: string) {
  console.log("token", token);
  const p = useMemo(() => Promise.all([importKey(strKey)]), []);

  return async (
    { name, directLink }: FileInfo,
    onProgress: (p: DownloadProgress) => void,
  ) => {
    if (!strKey || !token || !folder) {
      return;
    }

    const [key] = await p;

    onProgress({ type: "down", percent: 0 });

    const encArr = await new Promise<ArrayBuffer>((resolve, reject) => {
      const req = new XMLHttpRequest();
      req.responseType = "arraybuffer";
      const rate = speed();
      let bytes = 0;
      req.onprogress = (e) => {
        onProgress({ type: "down", percent: e.loaded / e.total });
        console.log(humanFileSize(rate(e.loaded - bytes)));
        bytes = e.loaded;
      };
      req.onload = () => resolve(req.response);
      req.onerror = () => {
        onProgress({ type: "fail" });
        reject();
      };
      req.open(
        "GET",
        directLink.replace(/store.\.gofile\.io/, "send-dl.deno.dev") +
          `?token=${token}`,
      );
      req.send();
    });

    onProgress({ type: "dec" });
    const iv = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(folder + name),
    );
    const decArr = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      encArr,
    );
    onProgress({ type: "done" });
    const url = URL.createObjectURL(new File([decArr], name));
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    link.target = "_blank";
    link.click();
  };
}
