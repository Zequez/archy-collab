const DEV_HOST = "localhost:3000";
const PROD_HOST = "archy.site";

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. thes ones mentioned and...
     * 2. all root files inside /public (e.g. /favicon.ico)
     */
    "/((?!Users|@id|@vite|@fs|src|node_modules|favicon.svg).*)",
  ],
};

export function validateURL(url: string | URL): string {
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

export default function middleware(req: Request) {
  const url = new URL(req.url);
  const baseHost =
    process.env.NODE_ENV === "production" && process.env.VERCEL === "1"
      ? PROD_HOST
      : DEV_HOST;
  const hostname = req.headers.get("host") || `demo.${baseHost}`;
  const currentHost = hostname.replace(`.${baseHost}`, "");

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

  url.host = baseHost;

  if (currentHost === "app") {
    url.pathname = `/app${url.pathname}`;
    return responseRewrite(url);
  }

  // It's the base app
  if (hostname === DEV_HOST || hostname === PROD_HOST) {
    return responseNext();
  }

  url.pathname = `/sites/${currentHost}${url.pathname}`;

  return responseRewrite(url);
}
