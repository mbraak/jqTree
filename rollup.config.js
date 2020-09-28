import fs from "fs";
import path from "path";
import jsonfile from "jsonfile";
import template from "lodash.template";
import typescript from "@rollup/plugin-typescript";
import { terser } from "rollup-plugin-terser";
import serve from "rollup-plugin-serve";
import coverage from "rollup-plugin-istanbul";

const getBanner = () => {
    const headerTemplate = fs.readFileSync("./src/header.txt", "utf8");
    const { version } = jsonfile.readFileSync("package.json");

    const data = {
        version,
        year: new Date().getFullYear(),
    };

    const banner = template(headerTemplate)(data);
    return `/*\n${banner}\n*/`;
};

const debugBuild = Boolean(process.env.DEBUG_BUILD);
const devServer = Boolean(process.env.SERVE);
const includeCoverage = Boolean(process.env.COVERAGE);

const plugins = [typescript()];

if (!debugBuild) {
    const terserPlugin = terser({
        output: {
            comments: /@license/,
        },
    });
    plugins.push(terserPlugin);
}

if (includeCoverage) {
    const coveragePlugin = coverage({
        esModules: true,
    });
    plugins.push(coveragePlugin);
}

if (devServer) {
    const servePlugin = serve({
        contentBase: [
            path.join(__dirname, "devserver"),
            path.join(__dirname, "static"),
            __dirname,
        ],
        port: 8080,
    });
    plugins.push(servePlugin);
}

export default {
    input: "src/tree.jquery.ts",
    output: {
        banner: getBanner(),
        file: debugBuild ? "tree.jquery.debug.js" : "tree.jquery.js",
        format: "iife",
        globals: {
            jquery: "jQuery",
        },
        name: "jqtree",
        sourcemap: true,
    },
    external: ["jquery"],
    plugins,
};
