const DEV_HOST = "localhost:3000";
const PROD_HOST = "archy.site";

const platformHosts = ["localhost:3000", "archy.site", "archy.site:3000"];

export const hostMap: { [key: string]: string } = {
  "ezequielschwartzman.local:3000": "eze",
  "ezequielschwartzman.org": "eze",
  "nickfeint.com": "nick",
  "eltemplo.com": "templo.nach",
};

// export const modulesMap: { [key: string]: string } = {
//   // '_': 'index',
//   squares: "editable-page",
//   sandbox: "editable-page",
//   eze: "editable-page",
//   "potato.eze": "editable-page",
//   // ezequiel
//   ezequiel: "links",
//   "cv.ezequiel": "cv",
//   "wall.ezequiel": "plain-page",
//   "mission-pomodoros.ezequiel": "embedded-gsheets",
//   // nick
//   nick: "embedded-links",
//   "songs.nick": "songs",
//   "templo.nach": "links",
// };

export const baseHost =
  process.env.NODE_ENV === "production" && process.env.VERCEL === "1"
    ? PROD_HOST
    : DEV_HOST;

export const extractAddress = (requestedHostname: string): string | null => {
  // This means ezequielschwartzma.org => eze; or work.ezequielschwartzman.org => work.eze;
  // console.log("Checking mapped hosts");
  for (let mappedHost in hostMap) {
    if (requestedHostname.endsWith(mappedHost)) {
      const subdomains = requestedHostname.slice(0, -mappedHost.length);
      const matchedMappedHost = hostMap[mappedHost];
      return `${subdomains}${matchedMappedHost}`;
    }
  }

  // This means the TLD is not on the host name, so we try to match it with the platformHosts
  // So localhost:3000, archy.site => _
  // console.log("Checking platform hosts");
  for (let platformHost of platformHosts) {
    if (requestedHostname.endsWith(platformHost)) {
      // console.log("Matched!", platformHost);
      const subdomains = requestedHostname.slice(0, -platformHost.length - 1);
      // console.log("Subdomains", subdomains);
      if (subdomains) {
        return subdomains;
      } else {
        return "_";
      }
    }
  }

  // If we reach here it means we are accessing the platform from an unregistered domain
  return null;
};

// export function removeBaseSharedHost(fullHostname: string): string {
//   return fullHostname.replace(
//     new RegExp(`\\.?${baseHost.replace(".", "\\.")}$`),
//     ""
//   );
// }

// // wall.ezequielschwartzman.org => wall.ezequiel.archy.site | wall.ezequiel.localhost:3000
// export function rewriteIndependentHostWishSharedHost(anyHost: string): string {
//   for (let host in hostMap) {
//     if (anyHost.endsWith(host)) {
//       const subdomains = anyHost.slice(0, -host.length);
//       const localAgent = hostMap[host];
//       return `${subdomains}${localAgent}.${baseHost}`;
//     }
//   }

//   return anyHost;
//   // return hostMap[anyHost] || anyHost;
// }

// rewriteIndependentHostWishSharedHost.test = () => {
//   // With baseHost = localhost:3000
//   console.info("rewriteIndependentHostWishSharedHost");
//   let tf = rewriteIndependentHostWishSharedHost;
//   // Phase 1
//   assert(tf("archy.site"), "archy.site");
//   assert(tf("ezequielschwartzman.local:3000"), "eze.localhost:3000");
//   assert(tf("ezequielschwartzman.org"), "eze.localhost:3000");
//   assert(tf("nickfeint.com"), "nick.localhost:3000");
//   // Phase 2
//   assert(tf("wall.ezequielschwartzman.org"), "wall.eze.localhost:3000");
// };

// // ████████╗███████╗███████╗████████╗███████╗
// // ╚══██╔══╝██╔════╝██╔════╝╚══██╔══╝██╔════╝
// //    ██║   █████╗  ███████╗   ██║   ███████╗
// //    ██║   ██╔══╝  ╚════██║   ██║   ╚════██║
// //    ██║   ███████╗███████║   ██║   ███████║
// //    ╚═╝   ╚══════╝╚══════╝   ╚═╝   ╚══════╝

// // I actually have an emotional reaction with the terms PASS and FAIL, so I prefer to use FLOW and WALL.
// function assert<T>(val1: T, val2: T) {
//   // console.info("-- ")
//   if (val1 === val2) {
//     console.info("\x1b[36m\x1b[44mFLOW\x1b[0m", val1);
//   } else {
//     console.error("\x1b[37m\x1b[40mWALL\x1b[0m", val1, val2);
//   }
// }
