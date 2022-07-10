import { useEffect, useMemo, useState } from "react";

import { decode, encode } from "./base64";
import { deferred } from "./deferred";
import { pooledMap } from "./pool";
import { speedometer } from "./speedometer";
import { UploadFile, UploadOptions } from "./utils";

async function get(endpoint: string, params: Record<string, string> = {}) {
  const search = new URLSearchParams(params).toString();
  const r = await fetch(`https://api.gofile.io/${endpoint}?${search}`);
  const json = await r.json();
  if (json.status !== "ok") {
    throw json;
  }
  return json.data;
}

async function put(endpoint: string, data: Record<string, string>) {
  const search = new URLSearchParams(data).toString();
  const r = await fetch(`https://api.gofile.io/${endpoint}`, {
    method: "PUT",
    body: search,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  const json = await r.json();
  if (json.status !== "ok") {
    throw json;
  }
  return json.data;
}

async function getAccount(
  expires: number,
): Promise<{ token: string; folder: string }> {
  const { token } = await get("createAccount");
  const { rootFolder } = await get("getAccountDetails", { token });
  const { id: folder } = await put("createFolder", {
    parentFolderId: rootFolder,
    folderName: "asdfqwer",
    token,
  });

  await put("setFolderOption", {
    token,
    folderId: folder,
    option: "expire",
    value: String(Math.floor(Date.now() / 1000) + expires),
  });

  return { token, folder };
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

interface EncryptResult {
  iv: ArrayBuffer;
  bytes: ArrayBuffer;
  name: string;
  key: string;
}

async function encrypt(
  file: File,
  key: CryptoKey,
  folder: string,
): Promise<Pick<EncryptResult, "iv" | "bytes">> {
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
  | { type: "up"; loaded: number; total: number; speed: number }
  | { type: "fail" }
  | { type: "done_up" };

type ProgressFn = (key: string, p: UploadProgress) => void;

function upload({
  key,
  name,
  bytes,
  token,
  folder,
  server,
  expires,
  onProgress,
}: {
  key: string;
  name: string;
  bytes: ArrayBuffer;
  token: string;
  folder: string;
  server: string;
  expires: number;
  onProgress: ProgressFn;
}) {
  const body = new FormData();
  body.set("file", new File([bytes], name));
  body.set("token", token);
  body.set("folderId", folder);
  body.set("expire", String(Math.floor(Date.now() / 1000) + expires));

  const req = new XMLHttpRequest();
  return {
    cancel: () => req.abort(),
    result: new Promise<Omit<UploadResult, "iv">>((resolve, reject) => {
      const speed = speedometer();
      let previous = 0;
      req.responseType = "json";
      req.upload.onprogress = (e) => {
        onProgress(key, {
          type: "up",
          loaded: e.loaded,
          total: e.total,
          speed: speed(e.loaded - previous),
        });
        previous = e.loaded;
      };
      req.onload = () => {
        if (req.response?.data?.fileId && req.response?.data?.fileName) {
          onProgress(key, { type: "done_up" });
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
      req.onabort = () => reject();
      req.open("POST", `https://${server}.gofile.io/uploadFile`, true);
      req.send(body);
    }),
  };
}

export async function deleteFiles(ids: string[], token: string) {
  const search = new URLSearchParams({
    contentsId: ids.join(","),
    token,
  }).toString();
  const r = await fetch(`https://api.gofile.io/deleteContent`, {
    method: "DELETE",
    body: search,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  const json = await r.json();
  if (json.status !== "ok") {
    throw json;
  }
  return json.data;
}

export function useUpload(
  files: UploadFile[],
  { expires }: UploadOptions,
  onProgress: ProgressFn,
  onCompleted: (key: string, token: string, rootFolder: string) => void,
  reset: () => void,
) {
  const p = useMemo(
    () => Promise.all([getAccount(expires), getSymmetricKey(), getServer()]),
    [],
  );
  const cancelMap = useMemo(() => new Map<string, () => void>(), []);

  const [uploaded, setUploaded] = useState<UploadResult[]>([]);

  useEffect(() => {
    if (files.length === 0) {
      reset();
    } else if (uploaded.length >= files.length) {
      (async () => {
        const [{ token, folder }, key] = await p;
        const keyStr = encode(
          new Uint8Array(await crypto.subtle.exportKey("raw", key)),
        );
        onCompleted(keyStr, token, folder);
      })();
    }
  }, [files.length, uploaded.length]);

  const doEncrypt = async (
    { file, key }: UploadFile,
    encryptionKey: CryptoKey,
    folder: string,
  ) => {
    onProgress(key, { type: "enc" });
    const signal = deferred<never>();
    cancelMap.set(key, () => {
      signal.reject("cancelled");
    });
    try {
      const { bytes, iv } = await Promise.race([
        encrypt(file, encryptionKey, folder),
        signal,
      ]);
      onProgress(key, { type: "wait_up" });

      return {
        key,
        name: file.name,
        bytes,
        iv,
      };
    } catch (e) {
      console.error(e);
      onProgress(key, { type: "fail" });
      throw e;
    }
  };

  const doUpload = async (
    { key, name, bytes, iv }: EncryptResult,
    token: string,
    server: string,
    folder: string,
  ) => {
    onProgress(key, {
      type: "up",
      loaded: 0,
      total: bytes.byteLength,
      speed: 0,
    });
    try {
      const { cancel, result } = upload({
        key,
        name,
        bytes,
        token,
        server,
        folder,
        expires,
        onProgress,
      });
      cancelMap.set(key, cancel);

      const { fileName, fileId } = await result;
      cancelMap.set(key, () => {
        setUploaded((old) => old.filter((x) => x.fileId !== fileId));
        deleteFiles([fileId], token).catch(() => {});
      });

      return {
        iv: new Uint8Array(iv),
        fileId,
        fileName,
      };
    } catch (e) {
      console.error(e);
      onProgress(key, { type: "fail" });
      throw e;
    }
  };

  return {
    cancel: (key: string) => {
      cancelMap.get(key)?.();
      cancelMap.delete(key);
    },
    upload: async (key: string) => {
      const file = files.find((f) => f.key === key);
      if (file) {
        try {
          const [{ folder, token }, encryptionKey, server] = await p;
          const encResult = await doEncrypt(file, encryptionKey, folder);
          const uploadResult = await doUpload(encResult, token, server, folder);
          setUploaded((old) => old.concat(uploadResult));
        } catch {
          onProgress(key, { type: "fail" });
        }
      }
    },
    uploadAll: async () => {
      try {
        const [{ token, folder }, encryptionKey, server] = await p;

        const encryptIterable = pooledMap(
          1,
          files,
          (file) => doEncrypt(file, encryptionKey, folder),
        );

        const uploadIterable = pooledMap(
          4,
          encryptIterable,
          (data) => doUpload(data, token, server, folder),
        );

        for await (const result of uploadIterable) {
          setUploaded((old) => old.concat(result));
        }
      } catch {
        files.forEach((f) => onProgress(f.key, { type: "fail" }));
      }
    },
  };
}

export type DownloadProgress =
  | { type: "wait_down" }
  | { type: "down"; loaded: number; total: number; speed: number }
  | { type: "dec" }
  | { type: "fail" }
  | { type: "done_down" };

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
  link: string;
}

interface Contents {
  [key: string]: FileInfo & { type: string };
}

export type UseFilesResult =
  | { state: "fail"; files: null; reason: string }
  | { state: "wait"; files: null }
  | { state: "done"; files: FileInfo[]; removeFile: (key: string) => void };

export function useFiles(token?: string, folderId?: string): UseFilesResult {
  const [files, setFiles] = useState<FileInfo[] | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    (async () => {
      if (!token || !folderId) {
        return;
      }

      try {
        const { contents } = (await get("getContent", {
          token,
          contentId: folderId,
          websiteToken: "12345",
          cache: "true",
        })) as { contents: Contents };

        const files = Object.values(contents).filter((x) => x.type === "file");
        setFiles(files);
      } catch (e: any) {
        let reason = "unknown";
        if (typeof e === "object" && typeof e?.status === "string") {
          reason = e.status;
        }
        setError(reason);
      }
    })();
  }, []);

  if (error) {
    return { files: null, state: "fail", reason: error };
  }

  if (!files) {
    return { files: null, state: "wait" };
  }

  return {
    files,
    state: "done",
    removeFile: (key: string) => {
      setFiles((old) => old?.filter((f) => f.id !== key) ?? null);
    },
  };
}

export function useDownload(strKey?: string, token?: string, folder?: string) {
  const p = useMemo(() => Promise.all([importKey(strKey)]), []);
  const cancelMap = useMemo(() => new Map<string, () => void>(), []);

  return {
    cancel: (key: string) => {
      cancelMap.get(key)?.();
      cancelMap.delete(key);
    },
    download: async (
      { name, link, size, id }: FileInfo,
      onProgress: (p: DownloadProgress) => void,
    ) => {
      if (!strKey || !token || !folder) {
        return;
      }

      onProgress({
        type: "down",
        loaded: 0,
        total: size,
        speed: 0,
      });
      const [key] = await p;

      const encArr = await new Promise<ArrayBuffer>((resolve, reject) => {
        const speed = speedometer();
        const req = new XMLHttpRequest();
        cancelMap.set(id, () => req.abort());
        req.responseType = "arraybuffer";
        let previous = 0;
        req.onprogress = (e) => {
          onProgress({
            type: "down",
            loaded: e.loaded,
            total: e.total,
            speed: speed(e.loaded - previous),
          });
          previous = e.loaded;
        };
        req.onload = () => resolve(req.response);
        req.onerror = () => {
          onProgress({ type: "fail" });
          reject();
        };
        req.onabort = () => reject();
        req.open(
          "GET",
          link.replace(
            /store.*\.gofile\.io/,
            "send-dl.deno.dev",
          ) +
            `?token=${token}`,
        );
        req.send();
      });

      const signal = deferred<never>();
      cancelMap.set(id, () => signal.reject("cancelled"));
      onProgress({ type: "dec" });
      const iv = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(folder + name),
      );
      const decArr = await Promise.race([
        signal,
        crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, encArr),
      ]);
      onProgress({ type: "done_down" });
      const url = URL.createObjectURL(new File([decArr], name));
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = name;
      anchor.target = "_blank";
      anchor.click();
    },
  };
}
