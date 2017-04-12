var fs = require ("fs");
var path = require("path");
var webpack = require("webpack");
var template = require("lodash.template");
var jsonfile = require("jsonfile");


module.exports = function(debug) {
    function getHeader() {
        if (debug) {
            return "";
        }
        else {
            var header_template = fs.readFileSync("./src/header.txt", "utf8");
            var package = jsonfile.readFileSync("package.json");

            var data = {
                version: package.version,
                year: new Date().getFullYear()
            };

            return template(header_template)(data);
        }
    }

    var config = {
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
            "jquery": "jQuery"
        }
    };

    if (debug) {
        config["devtool"] = "source-map";
        config["watch"] = true;
    }
    else {
        config["plugins"] = [
            new webpack.BannerPlugin(getHeader())
        ];
    }

    return config;
}
