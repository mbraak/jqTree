const fs = require("fs");
const path = require("path");
const webpack = require("webpack");
const template = require("lodash.template");
const jsonfile = require("jsonfile");

module.exports = function(debug, minimize) {
    function getHeader() {
        if (debug) {
            return "";
        } else {
            const headerTemplate = fs.readFileSync("./src/header.txt", "utf8");
            const package = jsonfile.readFileSync("package.json");

            const data = {
                version: package.version,
                year: new Date().getFullYear()
            };

            return template(headerTemplate)(data);
        }
    }

    const config = {
        entry: {
            "tree.jquery": ["./src/tree.jquery.ts"],
            test: ["./src_test/test.ts"]
        },
        output: {
            path: path.resolve(__dirname, "build"),
            filename: "[name].js"
        },
        resolve: {
            extensions: [".ts", ".js"]
        },
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    exclude: /node_modules/,
                    use: {
                        loader: "ts-loader"
                    }
                }
            ]
        },
        externals: {
            jquery: "jQuery"
        },
        optimization: {
            minimize: minimize
        },
        devServer: {
            contentBase: [
                path.join(__dirname, "devserver"),
                path.join(__dirname, "static"),
                __dirname
            ]
        }
    };

    if (debug) {
        config["devtool"] = "source-map";
        config["watch"] = true;
    } else {
        config["plugins"] = [new webpack.BannerPlugin(getHeader())];
    }

    return config;
};
