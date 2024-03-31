import fs from "fs";
import jsonfile from "jsonfile";
import template from "lodash.template";
import { babel } from "@rollup/plugin-babel";
import resolve from "@rollup/plugin-node-resolve";
import serve from "rollup-plugin-serve";
import terser from "@rollup/plugin-terser";
import { codecovRollupPlugin } from "@codecov/rollup-plugin";

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

const resolvePlugin = resolve({ extensions: [".ts"] });

const babelConfigFile = includeCoverage
    ? "babel.coverage.config.json"
    : "babel.config.json";

const babelPlugin = babel({
    babelHelpers: "bundled",
    configFile: `./config/${babelConfigFile}`,
    extensions: [".ts"],
});

const plugins = [resolvePlugin, babelPlugin];

if (!debugBuild) {
    const terserPlugin = terser({
        output: {
            comments: /@license/,
        },
    });
    plugins.push(terserPlugin);
}

if (!debugBuild && process.env.CODECOV_TOKEN) {
    const codecovPlugin = codecovRollupPlugin({
        bundleName: "jqtree-bundle",
        enableBundleAnalysis: true,
        uploadToken: process.env.CODECOV_TOKEN,
    });
    plugins.push(codecovPlugin);
}

if (devServer) {
    const servePlugin = serve({
        contentBase: ["./devserver", "./docs/static", "./"],
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
