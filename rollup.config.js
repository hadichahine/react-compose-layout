import peerDepsExternal from "rollup-plugin-peer-deps-external";
import resolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import pkg from "./package.json" assert { type: "json" };

export default {
  input: "index.jsx",
  output: [
    {
      file: pkg.main,
      format: "esm",
      sourcemap: true,
    },
  ],
  plugins: [
    peerDepsExternal(),
    resolve(),
    babel({
      babelHelpers: "bundled",
      presets: ["@babel/preset-react"],
      extensions: [".js", ".jsx"],
    }),
    commonjs(),
  ],
};
