import { rollup } from "rollup";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import { terser } from "rollup-plugin-terser";
import path from "path";

const input = "./src/components/Editor.tsx";
const outputDir = "./src/components";
const outputFileName = "_Editor.js";

export default function build(watch) {
  const watchOptions = watch
    ? {
        input,
        output: {
          dir: outputDir,
          format: "cjs",
          sourcemap: true,
        },
        watch: {
          include: ["./src/components/**"],
        },
        plugins: [nodeResolve(), commonjs(), typescript()],
      }
    : null;

  const buildOptions = {
    input,
    output: {
      file: path.join(outputDir, outputFileName),
      format: "cjs",
    },
    plugins: [nodeResolve(), commonjs(), typescript(), terser()],
  };

  const options = watch ? watchOptions : buildOptions;

  return rollup(options).then((bundle) => {
    if (watch) {
      bundle.write({
        dir: outputDir,
        format: "cjs",
        sourcemap: true,
      });
    } else {
      return bundle.write(buildOptions.output);
    }
  });
}

if (process.argv.includes("--watch")) {
  build(true);
} else {
  build(false);
}
