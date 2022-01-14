import { UploadProgress } from "./hooks";
import { UploadFile } from "./utils";

interface Props {
  files: UploadFile[];
  progress: Record<number, UploadProgress>;
}

export function Uploading({ files, progress }: Props) {
  return (
    <div>
      {files.map(({ file, key }, i) => {
        const p = progress[i];
        return (
          <div key={key}>
            <div>{file.name}</div>
            <div>
              {p.type} {"percent" in p ? (p.percent * 100).toFixed(2) : ""}
            </div>
          </div>
        );
      })}
    </div>
  );
}
