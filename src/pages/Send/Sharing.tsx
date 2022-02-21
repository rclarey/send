import { useEffect, useRef } from "react";

import QRCode from "qrcode";

interface Props {
  url: string;
}

function TwoDimensionalCode({ url }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url);
    }
  }, [canvasRef.current]);

  return <canvas className="sharing_code" ref={canvasRef} />;
}

export function Sharing({ url }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const copyUrl = () => {
    if (inputRef.current) {
      inputRef.current.select();
      document.execCommand("copy");
    }
  };

  return (
    <div className="content">
      <h1 className="titlearea">Your files are ready!</h1>
      <div className="background sharing">
        <h2 className="sharing_subtitle">
          Share the link, or scan the code to download the files
        </h2>
        <div className="sharing_row">
          <input
            className="sharing_url"
            ref={inputRef}
            readOnly
            value={url}
            onClick={() => inputRef.current?.select()}
          />
          <button className="sharing_button" onClick={copyUrl}>
            Copy
          </button>
        </div>
        <div className="sharing_row">
          <TwoDimensionalCode url={url} />
        </div>
      </div>
    </div>
  );
}
