const mimeTypes = {
  svg: "image/svg+xml",
  ico: "image/x-icon",
};

export const nameToMime = (name: string): string => {
  const ext = (name.match(/\.([a-z0-9]+)$/i) || ["", ""])[1];
  return (mimeTypes as any)[ext] || "";
};

export const extToMime = (ext: string) => (mimeTypes as any)[ext];

export default mimeTypes;
