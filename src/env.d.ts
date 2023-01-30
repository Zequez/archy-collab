/// <reference types="astro/client" />
/// <reference types="vite-plugin-pwa/client" />

declare module "*.elm" {
  const content: () => any;
  export default content;
}
