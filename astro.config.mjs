import { defineConfig } from "astro/config";

// https://astro.build/config
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
import react from "@astrojs/react";

// https://astro.build/config
import vercel from "@astrojs/vercel/serverless";

import elm from "astro-integration-elm";

import AstroPWA from "@vite-pwa/astro";

import yaml from "@rollup/plugin-yaml";

// https://astro.build/config
export default defineConfig({
  integrations: [
    tailwind({
      config: {
        applyBaseStyles: false,
      },
    }),
    react(),
    elm(),
  ], // AstroPWA()
  output: "server",
  adapter: vercel(),
  vite: {
    plugins: [yaml()],
    build: {
      assetsInlineLimit: 0,
    },
  },
});
