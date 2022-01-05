import { useState } from "react";

import { DropZone } from "./DropZone";
import { InfoArea } from "./InfoArea";

import { useUpload } from "./hooks";
import { randomString, UploadFile } from "./utils";

export function Send() {
  const upload = useUpload();
  const [files, setFiles] = useState<UploadFile[]>([]);

  return (
    <div
      className="container"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => e.preventDefault()}
    >
      <DropZone
        addFiles={(files) =>
          setFiles((old) => [
            ...old,
            ...files.map((file) => ({ file, id: randomString() })),
          ])
        }
      />
      <InfoArea
        files={files}
        removeFile={(i) =>
          setFiles((old) => [...old.slice(0, i), ...old.slice(i + 1)])
        }
      />
    </div>
  );
}
