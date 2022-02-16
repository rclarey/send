import { useState } from "react";
import { randomString, UploadFile, UploadOptions } from "../../utils";
import { Selecting } from "./Selecting";
import { Sharing } from "./Sharing";
import { Uploading } from "./Uploading";

import "./index.css";

export type State =
  | { type: "selecting" }
  | { type: "uploading"; options: UploadOptions }
  | { type: "sharing"; url: string };

export function Send() {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [state, setState] = useState<State>({ type: "selecting" });

  const addFiles = (files: File[]) => {
    setFiles((old) => [
      ...old,
      ...files.map((file) => ({ file, key: randomString() })),
    ]);
  };

  const removeFile = (key: string) => {
    setFiles((old) => old.filter((f) => f.key !== key));
  };

  if (state.type === "selecting") {
    return (
      <Selecting
        files={files}
        addFiles={addFiles}
        removeFile={removeFile}
        upload={(options) => setState({ type: "uploading", options })}
      />
    );
  }

  if (state.type === "uploading") {
    return (
      <Uploading
        options={state.options}
        files={files}
        finish={(url: string) => setState({ type: "sharing", url })}
      />
    );
  }

  return <Sharing url={state.url} />;
}
