import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [],
  root: resolve(__dirname, "."),
  server: {
    port: 3917,
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
