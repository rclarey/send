import { useEffect, useMemo, useState } from "react";
import { FileList } from "../../components/FileList";
import { DeleteModal } from "../../components/Modal";
import {
  deleteFiles,
  DownloadProgress,
  useDownload,
  useFiles,
} from "../../hooks";

function parseURL(): { key?: string; token?: string; folder?: string } {
  const hash = window.location.hash.slice(1);
  const [key, token, folder] = hash.split(":");
  return { key, token, folder };
}

export function Get() {
  const [progress, setProgress] = useState<Record<string, DownloadProgress>>(
    {}
  );
  const [pendingDelete, setPendingDelete] = useState<null | string>(null);
  const { key, token, folder } = useMemo(parseURL, []);
  const result = useFiles(token, folder);
  const { download, cancel } = useDownload(key, token, folder);

  useEffect(() => {
    if (result.state === "done") {
      setProgress(
        Object.fromEntries(
          result.files.map((f) => [f.id, { type: "wait_down" }])
        )
      );
    }
  }, [result.state]);

  if (!key || !token || !folder) {
    return (
      <div className="middle">
        <h1 className="titleArea">Invalid URL!</h1>
      </div>
    );
  }

  if (result.state === "fail") {
    if (result.reason === "error-expired") {
      return (
        <div className="middle">
          <h1 className="titlearea">Sorry, these files have expired!</h1>
        </div>
      );
    }
    if (result.reason === "no-files") {
      return (
        <div className="middle">
          <h1 className="titlearea">
            Sorry, these files have been deleted or cannot be found!
          </h1>
        </div>
      );
    }
    return (
      <div className="middle">
        <h1 className="titlearea">Something went wrong, please try again</h1>
      </div>
    );
  }

  const loading = result.state === "wait" || Object.keys(progress).length === 0;

  const doDownload = (key: string) => {
    download(result.files!.find((f) => f.id === key)!, (p) =>
      setProgress((old) => ({ ...old, [key]: p }))
    );
  };

  return (
    <div className="content">
      <h1 className="titlearea">You've been sent some files!</h1>
      {loading ? (
        <div className="background" />
      ) : (
        <>
          <FileList
            files={result.files.map((f) => ({ name: f.name, key: f.id }))}
            progress={progress}
            remove={(key) => {
              setPendingDelete(key);
            }}
            reload={doDownload}
            download={doDownload}
            stop={(key) => {
              cancel(key);
              setProgress((old) => ({ ...old, [key]: { type: "wait_down" } }));
            }}
          />
          <DeleteModal
            visible={!!pendingDelete}
            close={() => setPendingDelete(null)}
            action={() => {
              if (pendingDelete) {
                cancel(pendingDelete);
                deleteFiles([pendingDelete], token);
                result.removeFile(pendingDelete);
              }
            }}
          />
        </>
      )}
    </div>
  );
}
