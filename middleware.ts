import { extractAddress } from "./src/lib/host";

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. thes ones mentioned and...
     * 2. all root files inside /public (e.g. /favicon.ico)
     */
    "/((?!Users|editor|assets|public|@id|@vite|@fs|src|agents|node_modules|favicon.svg|bg.jpg|profile.jpg|[\\w-]+\\.\\w+).*)",
  ],
};

const defaultModule = "editable-page";

const createError = (msg: string, status: number) => {
  const e = new Error(msg);
  (e as any).status = status;
  return e;
};

export default function middleware(req: Request) {
  const url = new URL(req.url);

  const hostname = req.headers.get("host");
  if (!hostname) throw createError(`No host on header`, 400);

  const address = extractAddress(hostname);
  if (!address) throw createError(`Hostname not registered ${hostname}`, 400);

  const urlPath = url.pathname;

  // console.log("Resolved address", address);
  // console.log("URL HOST!", url.host);
  // console.log("URL PATH!", urlPath);

  // This is needed otherwise the host lookup fails when receiving requests from other hostnames
  url.host = process.env.VERCEL_URL ? "archy.site" : "localhost";
  url.pathname = urlPath === "/" ? `/${address}` : `/${address}${urlPath}`;
  return responseRewrite(url);
}

// This is something mostly extracted from NextJS
// It's deeply hidden, and the Github search cannot find it for some reason,
// so I'm leaving the link here: https://github.com/vercel/next.js/blob/canary/packages/next/src/server/web/spec-extension/response.ts
//-----------------------------------------

function validateURL(url: string | URL): string {
  try {
    return String(new URL(String(url)));
  } catch (error: any) {
    throw new Error(
      `URL is malformed "${String(
        url
      )}". Please use only absolute URLs - https://nextjs.org/docs/messages/middleware-relative-urls`
    );
  }
}

function responseRewrite(url: string | URL) {
  const headers = new Headers();
  headers.set("x-middleware-rewrite", validateURL(url));
  console.log("Rewriting", validateURL(url));
  return new Response(null, { headers });
}

// function responseNext() {
//   const headers = new Headers();
//   headers.set("x-middleware-next", "1");
//   new Response(null, { headers });
// }

// function responseRedirect(url: string) {
//   const headers = new Headers();
//   headers.set("Location", validateURL(url));
//   return new Response(null, { headers });
// }

// (async () => {
//   if (process.env.NODE_ENV !== "production") {
//     console.info("\x1b[42m\x1b[30m[TEST] Middleware\x1b[0m");
//     rewriteIndependentHostWishSharedHost.test();
//   }
// })();
