import { parse } from "node-html-parser";
import * as fs from "fs";
import * as path from "path";

const rootDir = process.cwd();
const production = import.meta.env.PROD;
const baseOutputDir = path.join(rootDir, production ? "dist" : "public");
const avatarsCachePath = path.join(baseOutputDir, ".cache/telegram-avatars");
fs.mkdirSync(avatarsCachePath, { recursive: true });

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

const avatarsPublicPathReplacer = (p: string) =>
  p.replace(new RegExp(`^${escapeRegExp(baseOutputDir)}`), "");

const avatarPath = (username: string) => {
  return path.join(avatarsCachePath, `${username}.jpg`);
};

export async function downloadTelegramAvatar(
  username: string,
  force: boolean = false
): Promise<string | null> {
  if (!username) return null;
  const imagePath = avatarPath(username);
  const publicImagePath = avatarsPublicPathReplacer(imagePath);

  if (!fs.existsSync(avatarPath(username)) || force) {
    console.log("Fetchin Telegram avatar", username);

    const url = await fetchTelegramAvatarUrl(username);

    if (url) {
      return await fetch(url, { method: "get" })
        .then((response) => response.arrayBuffer())
        .then((buffer) => {
          fs.writeFile(imagePath, new Uint8Array(buffer), {}, () => {
            console.log("Finished downloading Telegram avatar", imagePath);
          });
          return publicImagePath;
        })
        .catch((error) => {
          console.error("Error downloading Telegram avatar", error);
          return null;
        });
    } else {
      console.log("Tried to fetch avatar URL but failed ", username);
      return null;
    }
  } else {
    console.log("Fetching Telegram avatar skipped for ", username);
    return publicImagePath;
  }
}

// export async function downloadTelegramAvatars(
//   maybeUsernames: string[],
//   forceDownload: boolean = false
// ) {
//   const usernames = maybeUsernames.map(cleanUsername);
//   const usernamesToFetch: string[] = forceDownload
//     ? usernames
//     : usernames.reduce((all, username) => {
//         if (!fs.existsSync(avatarPath(username))) {
//           all.push(username);
//         }
//         return all;
//       }, [] as string[]);

//   console.log("Fetchin Telegram avatars", usernamesToFetch);

//   const urls = await Promise.all(
//     usernamesToFetch.map((username) => fetchTelegramAvatarUrl(username))
//   );

//   const usernamesAvatarsUrls = urls.reduce((all, url, i) => {
//     if (url) {
//       all[usernamesToFetch[i]] = url;
//     }
//     return all;
//   }, {} as { [key: string]: string });

//   return await Promise.all([
//     Object.entries(usernamesAvatarsUrls).map(async ([username, url]) => {
//       const imagePath = avatarPath(username);

//       return await fetch(url, { method: "get" })
//         .then((response) => response.arrayBuffer())
//         .then((buffer) =>
//           fs.writeFile(imagePath, new Uint8Array(buffer), {}, () => {
//             console.log("Finished?", imagePath);
//           })
//         )
//         .catch((error) => console.log("error", error));
//     }),
//   ]);
// }

export async function fetchTelegramAvatarUrl(maybeUsername: string) {
  const username = cleanUsername(maybeUsername);
  const response = await fetch(`https://t.me/${username}`);
  const htmlPage = await response.text();
  const dom = parse(htmlPage);
  const avatarImg = dom.querySelector(
    ".tgme_page_photo_image"
  ) as HTMLImageElement | null;
  const src = avatarImg && avatarImg.getAttribute("src");
  return src;
}

export type TelegramTransformerAdditions = {
  telegramAvatarUrl: string | null;
  telegramUsername: string | null;
};

export function telegramTransformer<K>(
  telegramColumn: keyof K
): (person: K) => Promise<TelegramTransformerAdditions> {
  return async (person: K) => {
    if (person[telegramColumn]) {
      const username = cleanUsername(person[telegramColumn] as string);
      return {
        telegramUsername: username,
        telegramAvatarUrl: await downloadTelegramAvatar(username),
      };
    } else {
      return { telegramUsername: null, telegramAvatarUrl: null };
    }
  };
}

// ------------

export function cleanUsername(username: string) {
  return username.toLowerCase().replace(/^@/, "");
}
