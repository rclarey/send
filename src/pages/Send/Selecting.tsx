import { animated, useTransition } from "@react-spring/web";
import { useMemo, useRef, useState } from "react";
import { IconButton } from "../../components/IconButton";
import { isDescendant, UploadFile, UploadOptions } from "../../utils";

interface Props {
  files: UploadFile[];
  addFiles: (files: File[]) => void;
  removeFile: (key: string) => void;
  upload: (options: UploadOptions) => void;
}

function TitleArea({ className }: { className?: string }) {
  return (
    <h1 className={(className ?? "") + " titlearea"}>
      Easy end-to-end encrypted file sharing
      <p className="titlearea_small">
        with download links that automatically expire
      </p>
    </h1>
  );
}

export function DropZone({
  addFiles,
  style,
}: Pick<Props, "addFiles"> & { style: {} }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const zoneRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  let className = "background dropzone";
  if (dragging) {
    className += " hover";
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        multiple
        className="dropzone_input"
        onChange={(e) => addFiles(Array.from(e.target.files!))}
      />
      <animated.div
        style={style}
        ref={zoneRef}
        className={className}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
        }}
        onDragEnter={() => setDragging(true)}
        onDragLeave={(e) => {
          if (!isDescendant(e.relatedTarget as HTMLElement, zoneRef.current)) {
            setDragging(false);
          }
        }}
        onDrop={() => {
          setDragging(false);
        }}
      >
        <button className="dropzone_button">Select files</button>
        <div className="hide-small">or drag and drop</div>
      </animated.div>
    </>
  );
}

function UploadOptionForm({
  files,
  removeFile,
  upload,
}: Omit<Props, "addFiles">) {
  const refMap = useMemo(() => new WeakMap(), []);
  const transition = useTransition(files, {
    from: { opacity: 0, marginBottom: "24px" },
    keys: (item) => item.key,
    enter: (item) => async (next) => {
      await next({
        opacity: 1,
        height: refMap.get(item)?.offsetHeight,
        marginBottom: "16px",
      });
    },
    leave: () => async (next) => {
      await next({ opacity: 0 });
      await next({ height: 0, marginBottom: "0px" });
    },
    trail: 50,
    config: (_1, _2, state) =>
      state === "leave" ? { tension: 300, clamp: true } : {},
  });

  const [shareWith, setShareWith] = useState("");
  const shareWithOptions = [{ label: "Anyone with the link", value: "" }];

  const [expires, setExpires] = useState("3600");
  const expiresOptions = [
    { label: "1 hour", value: "3600" },
    { label: "3 hours", value: "10800" },
    { label: "6 hours", value: "21600" },
    { label: "12 hours", value: "43200" },
    { label: "24 hours", value: "86400" },
  ];

  return (
    <div className="options">
      <div className="options_list">
        {transition((style, f) => (
          <animated.div style={style}>
            <div
              className="options_file"
              ref={(ref) => ref && refMap.set(f, ref)}
            >
              <p className="options_filename">{f.file.name}</p>
              <IconButton
                type="x"
                onClick={() => removeFile(f.key)}
                title="Remove file"
              />
            </div>
          </animated.div>
        ))}
      </div>
      <div className="options_form">
        <div>
          <select
            className="select options_sharewith"
            onChange={(e) => {
              setShareWith(e.target.value);
            }}
            value={shareWith}
          >
            {shareWithOptions.map((o) => (
              <option value={o.value} key={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          can download these files, which expire in
          <select
            className="select options_expires"
            onChange={(e) => {
              setExpires(e.target.value);
            }}
            value={expires}
          >
            {expiresOptions.map((o) => (
              <option value={o.value} key={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <button
          className="options_upload"
          onClick={() => upload({ key: shareWith, expires: Number(expires) })}
        >
          Upload
        </button>
      </div>
    </div>
  );
}

export function Selecting({ files, addFiles, removeFile, upload }: Props) {
  const transition = useTransition(!files.length, {
    initial: { opacity: 1 },
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    config: { tension: 300, clamp: true },
    exitBeforeEnter: true,
  });

  return (
    <div
      className="content"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        if (e.dataTransfer.files.length) {
          addFiles(Array.from(e.dataTransfer.files!));
        }
        e.preventDefault();
      }}
    >
      {transition((style, hasFiles) =>
        hasFiles ? (
          <>
            <TitleArea />
            <DropZone addFiles={addFiles} style={style} />
          </>
        ) : (
          <>
            <TitleArea className="hide-small" />
            <animated.div style={style} className="background">
              <UploadOptionForm
                files={files}
                removeFile={removeFile}
                upload={upload}
              />
            </animated.div>
          </>
        )
      )}
    </div>
  );
}
