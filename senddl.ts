import { serve } from "https://deno.land/std@0.120.0/http/server.ts";

function addCorsHeaders(base?: Headers) {
  const h = new Headers(base);
  h.set("access-control-allow-origin", "*");
  h.set("access-control-allow-headers", "*");
  return h;
}

let server: string | null = null;
const p = (async () => {
  ({
    data: { server },
  } = await (await fetch("https://api.gofile.io/getServer")).json());
})();

serve(async (req) => {
  if (req.method.toUpperCase() === "OPTIONS") {
    return new Response(null, { headers: addCorsHeaders() });
  }

  if (!server) {
    await p;
  }
  const url = new URL(req.url);
  const token = url.searchParams.get("token")!;

  const headers = new Headers(req.headers);
  headers.set("cookie", `accountToken=${token}`);
  headers.delete("host");
  headers.delete("origin");
  headers.delete("referer");

  const res = await fetch(`https://${server}.gofile.io${url.pathname}`, {
    headers,
  });
  
  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers: addCorsHeaders(res.headers),
  });
});
