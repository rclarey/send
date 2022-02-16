import { encode } from "./base64";

export interface UploadFile {
  file: File;
  key: string;
}

export interface UploadOptions {
  key: string;
  expires: number;
}

export function randomString() {
  return encode(crypto.getRandomValues(new Uint8Array(18)));
}

export function humanFileSize(bytes: number) {
  if (bytes >= 1000000000) {
    return (bytes / 1000000000).toFixed(1) + " GB";
  }
  if (bytes >= 1000000) {
    return (bytes / 1000000).toFixed(1) + " MB";
  }
  if (bytes >= 1000) {
    return (bytes / 1000).toFixed(1) + " KB";
  }
  return bytes.toString() + " B";
}
export function isDescendant(
  a: HTMLElement | null,
  b: HTMLElement | null,
): boolean {
  if (!a || !b) {
    return false;
  }
  if (a === b) {
    return true;
  }
  return isDescendant(a.parentElement, b);
}
