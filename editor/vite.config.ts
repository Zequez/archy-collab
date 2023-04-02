import { resolve } from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// import WindiCSS from "vite-plugin-windicss";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";
import UnoCSS from "unocss/vite";
import presetWind from "@unocss/preset-wind";

export default defineConfig({
  plugins: [
    react(),
    UnoCSS({
      presets: [presetWind()],
      rules: [
        [
          "shadow-md",
          {
            "box-shadow":
              "0 0 6px -1px hsl(0 0% 0% / 0.3), 0 0 3px -1px hsl(0 0% 0% / 0.3)",
          },
        ],
        ["text-shadow-dark-1", { "text-shadow": "0 1px 0 hsla(0,0%,0%,0.4)" }],
      ],
      shortcuts: {
        "flex-vh": "flex items-center justify-center",
        "flex-v": "flex items-center",
        "flex-h": "flex justify-center",
        b1: "border border-solid",
      },
    }),
    cssInjectedByJsPlugin(),
  ],
  root: resolve(__dirname, "."),
  server: {
    port: 3917,
  },
  define: {
    "process.env": process.env,
  },
  build: {
    outDir: resolve(__dirname, "./dist"),
    // lib: {
    //   entry: resolve(__dirname, "src/bootstrapper.tsx"),
    //   name: "Editor",
    //   fileName: "editor",
    // },
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`,
      },
    },
  },
});
