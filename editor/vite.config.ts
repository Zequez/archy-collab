import { resolve } from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import WindiCSS from "vite-plugin-windicss";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";

export default defineConfig({
  plugins: [react(), WindiCSS(), cssInjectedByJsPlugin()],
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
