import { humanFileSize, UploadFile } from "./utils";

import "./InfoArea.css";

interface Props {
  files: UploadFile[];
  removeFile: (n: number) => void;
}

function Empty() {
  return (
    <div className="empty">
      <div>
        Easy end-to-end encrypted file sharing
        <p className="empty_small">
          with download links that automatically expire
        </p>
      </div>
    </div>
  );
}

function List({ files, removeFile }: Props) {
  return (
    <>
      <div className="filelist">
        {files.map((f, i) => (
          <div className="fileinfo" key={f.id}>
            <p className="filename">{f.file.name}</p>
            <p className="filesize">{humanFileSize(f.file.size)}</p>
            <button className="remove" onClick={() => removeFile(i)}>
              ✕
            </button>
          </div>
        ))}
      </div>
      <button className="uploadbtn">Upload</button>
    </>
  );
}

export function InfoArea({ files, removeFile }: Props) {
  return (
    <div className="infoarea">
      {!files.length ? (
        <Empty />
      ) : (
        <List files={files} removeFile={removeFile} />
      )}
    </div>
  );
}
