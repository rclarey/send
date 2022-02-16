import { useRef, useState } from "react";
import { XButton } from "../../components/XButton";
import { isDescendant, UploadFile, UploadOptions } from "../../utils";

interface Props {
  files: UploadFile[];
  addFiles: (files: File[]) => void;
  removeFile: (key: string) => void;
  upload: (options: UploadOptions) => void;
}

function TitleArea() {
  return (
    <h1 className="titlearea">
      Easy end-to-end encrypted file sharing
      <p className="titlearea_small">
        with download links that automatically expire
      </p>
    </h1>
  );
}

export function DropZone({ addFiles }: Pick<Props, "addFiles">) {
  const inputRef = useRef<HTMLInputElement>(null);
  const zoneRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  let className = "dropzone background";
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
      <div
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
        <div>or drag and drop</div>
      </div>
    </>
  );
}

function UploadOptionForm({
  files,
  removeFile,
  upload,
}: Omit<Props, "addFiles">) {
  const [shareWith, setShareWith] = useState("");
  const shareWithOptions = [{ label: "Anyone with the link", value: "" }];

  const [expires, setExpires] = useState("86400");
  const expiresOptions = [
    { label: "1 hour", value: "3600" },
    { label: "3 hours", value: "10800" },
    { label: "6 hours", value: "21600" },
    { label: "12 hours", value: "43200" },
    { label: "24 hours", value: "86400" },
  ];

  return (
    <div className="background options">
      <div className="options_list">
        {files.map((f) => (
          <div className="options_file" key={f.key}>
            <p className="options_filename">{f.file.name}</p>
            <XButton onClick={() => removeFile(f.key)} />
          </div>
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
      <TitleArea />
      {files.length === 0 ? (
        <DropZone addFiles={addFiles} />
      ) : (
        <UploadOptionForm
          files={files}
          removeFile={removeFile}
          upload={upload}
        />
      )}
    </div>
  );
}
