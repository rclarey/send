import { useMemo } from "react";

async function getAccount() {
  const { token } = await (
    await fetch("https://api.gofile.io/createAccount")
  ).json();
}

export function useUpload() {}
