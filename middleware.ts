const DEV_HOST = "localhost:3000";
const PROD_HOST = "archy.site";

export const hostMap: { [key: string]: string } = {
  // 'archy.site': '',
  // 'localhost:3000': '',
  "ezequielschwartzman.org": "ezequiel",
  "nickfeint.com": "nick",
  "eltemplo.com": "templo.nach",
};

export const modulesMap: { [key: string]: string } = {
  // '_': 'index',
  // ezequiel
  ezequiel: "embedded-links",
  "cv.ezequiel": "cv",
  "wall.ezequiel": "plain-page",
  "mission-pomodoros.ezequiel": "embedded-gsheets",
  // nick
  nick: "embedded-links",
  "songs.nick": "songs",
  "templo.nach": "links",
};

const baseHost =
  process.env.NODE_ENV === "production" && process.env.VERCEL === "1"
    ? PROD_HOST
    : DEV_HOST;

// const modules = ['cv', 'links', 'songs'];

function replaceFirstHostMap() {}

// ezequielschwartzman.org => /sites/links/ezequiel"
// cv.ezequiel => /sites/cv/ezequiel
// "nickfeint.com => "/sites/links"

/*
if url is on full hosts mapping replace whole url and

*/

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. thes ones mentioned and...
     * 2. all root files inside /public (e.g. /favicon.ico)
     */
    "/((?!Users|assets|public|@id|@vite|@fs|src|node_modules|favicon.svg|bg.jpg|profile.jpg|[\\w-]+\\.\\w+).*)",
  ],
};

function removeBaseSharedHost(fullHostname: string): string {
  return fullHostname.replace(new RegExp(`.${baseHost}$`), "");
}

function rewriteIndependentHostWishSharedHost(anyHost: string): string {
  return hostMap[anyHost] || anyHost;
}

export default function middleware(req: Request) {
  const url = new URL(req.url);

  const hostname = req.headers.get("host");
  if (!hostname) return responseNext();

  const agentHost = removeBaseSharedHost(
    rewriteIndependentHostWishSharedHost(hostname)
  );
  const choosenModule = modulesMap[agentHost];
  if (!choosenModule) return responseNext();
  // if (!choosenModule) return responseRedirect(`http://${baseHost}`);

  const agentHostParts = agentHost.split(".");
  const agent = agentHostParts.slice(-1);
  if (!agent) return responseNext();
  // if (!agent) return responseRedirect(`http://${baseHost}`);

  const newPath = `/modules/${choosenModule}/${agent}`;

  // This is needed otherwise the host lookup fails and the middleware crashes
  url.host = baseHost;

  url.pathname = newPath;
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

function responseNext() {
  const headers = new Headers();
  headers.set("x-middleware-next", "1");
  new Response(null, { headers });
}

function responseRedirect(url: string) {
  const headers = new Headers();
  headers.set("Location", validateURL(url));
  return new Response(null, { headers });
}
