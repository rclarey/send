import { PropsWithChildren } from "react";

import "./index.css";

function Link({ href, children }: PropsWithChildren<{ href: string }>) {
  return (
    <a className="link" rel="noreferrer noopener" target="_blank" href={href}>
      {children}
    </a>
  );
}

export function About() {
  return (
    <div className="content">
      <h1 className="titlearea">About</h1>
      <p className="about">
        This site uses AES-GCM with a 256-bit key to encrypt files between the
        sender and receiver. The encrypted files are uploaded to{" "}
        <Link href="https://gofile.io">gofile.io</Link>, and will automatically
        be deleted after the chosen expiry period.
      </p>
      <p className="about">
        The source code for this site can be found at{" "}
        <Link href="https://github.com/rclarey/send">
          github.com/rclarey/send
        </Link>
        .
      </p>
    </div>
  );
}
