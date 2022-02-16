import { PropsWithChildren } from "react";

import { Nav } from "./Nav";

import "./Layout.css";

export function Layout({ children }: PropsWithChildren<{}>) {
  return (
    <div className="layout">
      <Nav />
      <main className="main">
        {children}
      </main>
    </div>
  );
}
