import { useState } from "react";
import { animated, useTransition } from "@react-spring/web";
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
  const transition = useTransition(state, {
    initial: { opacity: 1 },
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    config: { tension: 300, clamp: true },
    exitBeforeEnter: true,
  });

  const addFiles = (files: File[]) => {
    setFiles((old) => [
      ...old,
      ...files.map((file) => ({ file, key: randomString() })),
    ]);
  };

  const removeFile = (key: string) => {
    setFiles((old) => old.filter((f) => f.key !== key));
  };

  return transition((styles, item) => {
    if (item.type === "selecting") {
      return (
        <animated.div style={styles}>
          <Selecting
            files={files}
            addFiles={addFiles}
            removeFile={removeFile}
            upload={(options) => setState({ type: "uploading", options })}
          />
        </animated.div>
      );
    }

    if (item.type === "uploading") {
      return (
        <animated.div style={styles}>
          <Uploading
            options={item.options}
            files={files}
            removeFile={removeFile}
            finish={(url: string) => setState({ type: "sharing", url })}
            reset={() => setState({ type: "selecting" })}
          />
        </animated.div>
      );
    }

    return (
      <animated.div style={styles}>
        <Sharing url={item.url} />
      </animated.div>
    );
  });
}
