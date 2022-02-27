import { useEffect, useState } from "react";
import { FileList } from "../../components/FileList";
import { UploadProgress, useUpload } from "../../hooks";
import { UploadFile, UploadOptions } from "../../utils";

interface Props {
  options: UploadOptions;
  files: UploadFile[];
  removeFile: (key: string) => void;
  finish: (url: string) => void;
  reset: () => void;
}

export function Uploading({
  options,
  files,
  removeFile,
  finish,
  reset,
}: Props) {
  const [progress, setProgress] = useState<Record<string, UploadProgress>>(() =>
    Object.fromEntries(files.map((f) => [f.key, { type: "wait_enc" }]))
  );
  const { cancel, upload, uploadAll } = useUpload(
    files,
    options,
    (key, p) =>
      setProgress((old) => ({
        ...old,
        [key]: p,
      })),
    (key, token, rootFolder) => {
      finish(
        new URL(
          `/get#${key}:${token}:${rootFolder}`,
          window.location.origin
        ).toString()
      );
    },
    reset
  );

  useEffect(() => {
    uploadAll();
  }, []);

  return (
    <div className="content">
      <FileList
        files={files.map((f) => ({ name: f.file.name, key: f.key }))}
        progress={progress}
        reload={upload}
        remove={(key) => {
          cancel(key);
          removeFile(key);
        }}
      />
    </div>
  );
}
