import { useEffect, useMemo, useState } from "react";

import { decode, encode } from "./base64";
import { poolIterable } from "./pool";
import { speed } from "./speedometer";
import { humanFileSize, UploadFile, UploadOptions } from "./utils";

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

async function encrypt(
  file: File,
  key: CryptoKey,
  folder: string,
): Promise<{ iv: ArrayBuffer; bytes: ArrayBuffer }> {
  const data = await file.arrayBuffer();
  const iv = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(folder + file.name),
  );

  return {
    iv,
    bytes: await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data),
  };
}

export interface UploadResult {
  iv: Uint8Array;
  fileId: string;
  fileName: string;
}

export type UploadProgress =
  | { type: "wait_enc" }
  | { type: "enc" }
  | { type: "wait_up" }
  | { type: "up"; percent: number }
  | { type: "fail" }
  | { type: "done" };

type ProgressFn = (key: string, p: UploadProgress) => void;

async function upload({
  key,
  name,
  bytes,
  token,
  rootFolder,
  server,
  expires,
  onProgress,
}: {
  key: string;
  name: string;
  bytes: ArrayBuffer;
  token: string;
  rootFolder: string;
  server: string;
  expires: number;
  onProgress: ProgressFn;
}) {
  const body = new FormData();
  body.set("file", new File([bytes], name));
  body.set("token", token);
  body.set("folderId", rootFolder);
  body.set("expire", String(Math.floor(Date.now() / 1000) + expires));

  return new Promise<Omit<UploadResult, "iv">>((resolve, reject) => {
    const req = new XMLHttpRequest();
    req.responseType = "json";
    req.upload.onprogress = (e) =>
      onProgress(key, { type: "up", percent: e.loaded / e.total });
    req.onload = () => {
      if (req.response?.data?.fileId && req.response?.data?.fileName) {
        onProgress(key, { type: "done" });
        resolve({
          fileId: req.response.data.fileId,
          fileName: req.response.data.fileName,
        });
      } else {
        onProgress(key, { type: "fail" });
        reject();
      }
    };
    req.onerror = () => {
      onProgress(key, { type: "fail" });
      reject();
    };
    req.open("POST", `https://${server}.gofile.io/uploadFile`, true);
    req.send(body);
  });
}

export function useUpload(
  files: UploadFile[],
  { expires }: UploadOptions,
  onProgress: ProgressFn,
  onCompleted: (key: string, token: string, rootFolder: string) => void,
) {
  const p = useMemo(
    () => Promise.all([getAccount(), getSymmetricKey(), getServer()]),
    [],
  );

  const [uploaded, setUploaded] = useState<UploadResult[]>([]);

  useEffect(() => {
    if (uploaded.length >= files.length) {
      (async () => {
        const [{ token, rootFolder }, key] = await p;
        const keyStr = encode(
          new Uint8Array(await crypto.subtle.exportKey("raw", key)),
        );
        onCompleted(keyStr, token, rootFolder);
      })();
    }
  }, [files.length, uploaded.length]);

  return {
    upload: async () => {
      const [{ token, rootFolder }, encryptionKey, server] = await p;

      const encryptIterable = poolIterable(
        Math.max(1, navigator.hardwareConcurrency - 1),
        files,
        async ({ file, key }) => {
          onProgress(key, { type: "enc" });
          try {
            const { bytes, iv } = await encrypt(
              file,
              encryptionKey,
              rootFolder,
            );
            onProgress(key, { type: "wait_up" });

            return {
              key,
              name: file.name,
              bytes,
              iv,
            };
          } catch (e) {
            onProgress(key, { type: "fail" });
            throw e;
          }
        },
      );

      const uploadIterable = poolIterable(
        4,
        encryptIterable,
        async ({ key, name, bytes, iv }) => {
          onProgress(key, { type: "up", percent: 0 });
          try {
            const { fileId, fileName } = await upload({
              key,
              name,
              bytes,
              token,
              server,
              rootFolder,
              expires,
              onProgress,
            });

            return {
              iv: new Uint8Array(iv),
              fileId,
              fileName,
            };
          } catch (e) {
            onProgress(key, { type: "fail" });
            throw e;
          }
        },
      );

      for await (const result of uploadIterable) {
        setUploaded((old) => old.concat(result));
      }
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
        const { contents } = (await get("getContent", {
          token,
          contentId: folderId,
          websiteToken: "websiteToken",
          cache: "true",
        })) as { contents: Contents };

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
