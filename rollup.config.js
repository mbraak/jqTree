import typescript from "@rollup/plugin-typescript";
import { terser } from "rollup-plugin-terser";

export default {
    input: "src/tree.jquery.ts",
    output: {
        file: "tree.jquery.js",
        format: "iife",
        globals: {
            jquery: "jQuery",
        },
        name: "jqtree",
    },
    external: ["jquery"],
    plugins: [typescript(), terser()],
};
