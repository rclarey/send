import { useState } from "react";

import { DropZone } from "./DropZone";
import { InfoArea } from "./InfoArea";

import { UploadProgress, UploadResult, useUpload } from "./hooks";
import { randomString, UploadFile } from "./utils";
import { Uploading } from "./Uploading";
import { encode } from "./base64";

export function Send() {
  const { upload, p } = useUpload();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [progress, setProgress] = useState<Record<number, UploadProgress>>({});
  const [uploading, setUploading] = useState(false);
  const doUpload = async (files: File[]) => {
    setUploading(true);
    setProgress(Object.fromEntries(files.map((_, i) => [i, { type: "wait" }])));

    const results: UploadResult[] = [];
    for (const [i, file] of files.entries()) {
      const result = await upload(file, (p) => {
        setProgress((old) => ({
          ...old,
          [i]: p,
        }));
      });
      results.push(result);
    }

    const [{ token, rootFolder }, key] = await p;
    const keyStr = encode(
      new Uint8Array(await crypto.subtle.exportKey("raw", key))
    );

    console.log(`http://localhost:3000/get#${keyStr}:${token}:${rootFolder}`);
  };

  return (
    <div
      className="container"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => e.preventDefault()}
    >
      {uploading ? (
        <Uploading files={files} progress={progress} />
      ) : (
        <>
          <DropZone
            addFiles={(files) =>
              setFiles((old) => [
                ...old,
                ...files.map((file) => ({ file, key: randomString() })),
              ])
            }
          />
          <InfoArea
            files={files}
            removeFile={(i) =>
              setFiles((old) => [...old.slice(0, i), ...old.slice(i + 1)])
            }
            upload={doUpload}
          />
        </>
      )}
    </div>
  );
}
