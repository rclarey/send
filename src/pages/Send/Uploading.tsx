import { useEffect, useState } from "react";
import { UploadProgress, useUpload } from "../../hooks";
import { UploadFile, UploadOptions } from "../../utils";

interface Props {
  options: UploadOptions;
  files: UploadFile[];
  finish: (url: string) => void;
}

export function Uploading({ options, files, finish }: Props) {
  const [progress, setProgress] = useState<Record<string, UploadProgress>>(() =>
    Object.fromEntries(files.map((f) => [f.key, { type: "wait_enc" }]))
  );
  const { upload } = useUpload(
    files,
    options,
    (key, p) =>
      setProgress((old) => ({
        ...old,
        [key]: p,
      })),
    (key, token, rootFolder) =>
      finish(
        new URL(
          `/get#${key}:${token}:${rootFolder}`,
          window.location.origin,
        ).toString(),
      ),
  );

  useEffect(() => {
    upload();
  }, []);

  return (
    <div>
      {files.map(({ file, key }) => {
        const p = progress[key];
        return (
          p && (
            <div key={key}>
              <div>{file.name}</div>
              <div>
                {p.type} {"percent" in p ? (p.percent * 100).toFixed(2) : ""}
              </div>
            </div>
          )
        );
      })}
    </div>
  );
}
