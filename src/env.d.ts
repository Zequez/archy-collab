/// <reference types="astro/client" />
/// <reference types="vite-plugin-pwa/client" />

declare module "*.elm" {
  const content: () => any;
  export default content;
}

declare module "*.yml" {
  const content: { [key: string]: any };
  export default content;
}

type Agent = {
  name: string;
  photo: string;
  background: string;
  navColor: string;
  modules: Module[];
};

type Module = {
  path: string;
  name: string;
  value: string;
  color: number;
};
