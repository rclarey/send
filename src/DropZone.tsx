import { useRef, useState } from "react";

import { isDescendant } from "./utils";

interface Props {
  addFiles: (files: File[]) => void;
}

export function DropZone({ addFiles }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const zoneRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  let className = "dropzone";
  if (dragging) {
    className += " hover";
  }

  return (
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
      onDrop={(e) => {
        if (e.dataTransfer.files.length) {
          addFiles(Array.from(e.dataTransfer.files!));
        }
      }}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        className="fileinput"
        onChange={(e) => addFiles(Array.from(e.target.files!))}
      />
      <div className="dropzone_contents">
        <button className="filebutton">Select files</button>
        <div>or drag and drop</div>
      </div>
    </div>
  );
}
