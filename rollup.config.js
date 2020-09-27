import typescript from "@rollup/plugin-typescript";
import { terser } from "rollup-plugin-terser";

const debugBuild = Boolean(process.env.DEBUG_BUILD);

const plugins = [typescript()];

if (!debugBuild) {
    plugins.push(terser());
}

export default {
    input: "src/tree.jquery.ts",
    output: {
        file: debugBuild ? "tree.jquery.debug.js" : "tree.jquery.js",
        format: "iife",
        globals: {
            jquery: "jQuery",
        },
        name: "jqtree",
    },
    external: ["jquery"],
    plugins,
};
