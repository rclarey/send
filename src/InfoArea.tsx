import { humanFileSize, UploadFile } from "./utils";

import "./InfoArea.css";

interface Props {
  files: UploadFile[];
  removeFile: (n: number) => void;
  upload: (files: File[]) => void;
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

function List({ files, removeFile, upload }: Props) {
  return (
    <>
      <div className="filelist">
        {files.map((f, i) => (
          <div className="fileinfo" key={f.key}>
            <p className="filename">{f.file.name}</p>
            <p className="filesize">{humanFileSize(f.file.size)}</p>
            <button className="remove" onClick={() => removeFile(i)}>
              ✕
            </button>
          </div>
        ))}
      </div>
      <button
        className="uploadbtn"
        onClick={() => upload(files.map((f) => f.file))}
      >
        Upload
      </button>
    </>
  );
}

export function InfoArea(props: Props) {
  return (
    <div className="infoarea">
      {!props.files.length ? <Empty /> : <List {...props} />}
    </div>
  );
}
