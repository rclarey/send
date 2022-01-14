import { useMemo, useState } from "react";

import { DownloadProgress, useDownload, useFiles } from "./hooks";
import { humanFileSize } from "./utils";

function parseURL(): { key?: string; token?: string; folder?: string } {
  const hash = window.location.hash.slice(1);
  const [key, token, folder] = hash.split(":");
  return { key, token, folder };
}

export function Get() {
  const [progress, setProgress] = useState<Record<number, DownloadProgress>>(
    {},
  );
  const { key, token, folder } = useMemo(parseURL, []);
  const result = useFiles(token, folder);
  const download = useDownload(key, token, folder);

  if (!key || !token || !folder) {
    return <>Bad URL!</>;
  }

  if (result.state === "fail") {
    return <>Something went wrong, please try again</>;
  }

  if (result.state === "wait") {
    return <>Loading...</>;
  }

  const { files } = result;

  return (
    <div className="container">
      {files.map((file, i) => {
        const p = progress[i] ?? { type: "wait" };
        return (
          <div key={file.id}>
            <span>
              {file.name} {humanFileSize(file.size)}
              {p.type} {"percent" in p ? p.percent.toFixed(2) : ""}
            </span>
            <button
              onClick={() =>
                download(
                  file,
                  (p) => setProgress((old) => ({ ...old, [i]: p })),
                )}
            >
              Download
            </button>
          </div>
        );
      })}
    </div>
  );
}
