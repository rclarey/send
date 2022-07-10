import { DownloadProgress, UploadProgress } from "../hooks";
import { humanFileSize } from "../utils";

import { IconButton } from "./IconButton";

import "./FileList.css";
import { useMemo } from "react";
import { animated, useTransition } from "@react-spring/web";

function timeLeft(remaining: number, speed: number) {
  const seconds = remaining / speed;
  if (seconds === Infinity) {
    return "";
  }
  if (seconds > 3600) {
    const hours = Math.floor(seconds / 3600);
    return `(about ${hours > 1 ? hours + " hours" : "an hour"} remaining)`;
  }
  if (seconds > 60) {
    const minutes = Math.floor(seconds / 60);
    return `(about ${
      minutes > 1 ? minutes + " minutes" : "a minute"
    } remaining)`;
  }
  if (seconds > 10) {
    return "(less than a minute remaining)";
  }
  return "(a few seconds remaining)";
}

function infoByProgress(p: UploadProgress | DownloadProgress) {
  if (p.type === "down" || p.type === "up") {
    const verb = p.type === "up" ? "Uploading" : "Downloading";
    return (
      <>
        <p className="filelist_info filelist_speed">
          {verb} at {humanFileSize(p.speed)}/s{" "}
          {timeLeft(p.total - p.loaded, p.speed)}
        </p>
        <p className="filelist_info">
          {humanFileSize(p.loaded)} / {humanFileSize(p.total)} (
          {((100 * p.loaded) / p.total).toFixed(1)}%)
        </p>
      </>
    );
  }

  const str = () => {
    switch (p.type) {
      case "wait_enc":
        return "Waiting to encrypt";
      case "enc":
        return "Encrypting...";
      case "dec":
        return "Decrypting...";
      case "wait_up":
        return "Waiting to upload";
      case "wait_down":
        return "Ready to download";
      case "done_up":
        return "Finished uploading";
      case "done_down":
        return "Finished downloading";
      case "fail":
        return "Something went wrong";
    }
  };

  return (
    <>
      <p className="filelist_info">{str()}</p>
      <p className="filelist_info">&nbsp;</p>
    </>
  );
}

interface Props {
  files: { name: string; key: string }[];
  progress: Record<string, UploadProgress | DownloadProgress>;
  reload: (key: string) => void;
  remove: (key: string) => void;
  download?: (key: string) => void;
  stop?: (key: string) => void;
  className?: string;
}

export function FileList({
  files,
  progress,
  reload,
  remove,
  download,
  stop,
  className,
}: Props) {
  const refMap = useMemo(
    () => new WeakMap<typeof files[0], HTMLDivElement>(),
    [],
  );
  const transition = useTransition(files, {
    keys: (item) => item.key,
    from: { opacity: 0, marginBottom: "32px" },
    enter: (item) =>
      async (next) => {
        await next({
          opacity: 1,
          height: refMap.get(item)?.offsetHeight,
          marginBottom: "24px",
        });
      },
    leave: () =>
      async (next) => {
        await next({ opacity: 0 });
        await next({ height: 0, marginBottom: "0px" });
      },
    trail: 50,
    config: (_1, _2, state) =>
      state === "leave" ? { tension: 300, clamp: true } : {},
  });
  return (
    <div className={(className ?? "") + " background filelist"}>
      {transition((style, f) => {
        const p = progress[f.key];
        const canDownload = download &&
          (p.type === "wait_down" || p.type === "done_down");
        const canStop = stop && (p.type === "down" || p.type === "dec");

        return (
          <animated.div style={style}>
            <div
              className="filelist_file"
              ref={(ref) => ref && refMap.set(f, ref)}
            >
              <div className="filelist_row">
                <p className="filelist_name">{f.name}</p>
                <div className="filelist_buttons">
                  {p.type === "fail" && (
                    <IconButton
                      type="reload"
                      onClick={() => reload(f.key)}
                      title="Retry filelist"
                    />
                  )}
                  {canDownload && (
                    <IconButton
                      type="download"
                      onClick={() => download(f.key)}
                      title="Download file"
                    />
                  )}
                  {canStop && (
                    <IconButton
                      type="stop"
                      onClick={() => stop(f.key)}
                      title="Stop downloading"
                    />
                  )}
                  <IconButton
                    type="x"
                    onClick={() => remove(f.key)}
                    title="Remove file"
                  />
                </div>
              </div>
              <div className="filelist_row">{infoByProgress(p)}</div>
              <div
                className="filelist_bar"
                style={p.type !== "up" && p.type !== "down"
                  ? { visibility: "hidden" }
                  : undefined}
              >
                {(p.type === "up" || p.type === "down") && (
                  <div
                    className="inner_bar"
                    style={{ width: `${(100 * p.loaded) / p.total}%` }}
                  />
                )}
              </div>
            </div>
          </animated.div>
        );
      })}
    </div>
  );
}
