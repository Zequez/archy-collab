const DEV_HOST = "localhost:3000";
const PROD_HOST = "archy.site";
const useProd =
  process.env.NODE_ENV === "production" && process.env.VERCEL === "1";
const baseHost = useProd ? PROD_HOST : DEV_HOST;
const protocol = useProd ? "https" : "http";

// Platform URL
export const pUrl = (site: string = "", usePath = false) => {
  return `${protocol}://${site && !usePath ? `${site}.` : ""}${baseHost}${
    usePath && site ? `/sites/${site}` : ""
  }`;
};
