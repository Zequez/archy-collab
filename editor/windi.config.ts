import { defineConfig } from "windicss/helpers";

export default defineConfig({
  alias: {
    "flex-vh": "flex items-center justify-center",
    "flex-v": "flex items-center",
    "flex-h": "flex justify-center",
    b1: "border border-solid",
  },
  theme: {
    extend: {
      cursor: {
        "ew-resize": "ew-resize",
      },
    },
  },
  plugins: [],
});
