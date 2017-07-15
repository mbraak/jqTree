const gulp = require("gulp");
const fs = require("fs");
const rename = require("gulp-rename");
const sass = require("gulp-sass");
const ts = require("gulp-typescript");

gulp.task("lib_ts", function () {
    const tsProject = ts.createProject('tsconfig.json');

    gulp.src("./src/*.ts")
        .pipe(tsProject())
        .pipe(gulp.dest("./lib"));
});

gulp.task("sass", function () {
    gulp.src("./jqtree.scss")
        .pipe(sass({ errLogToConsole: true }))
        .pipe(gulp.dest("./"))
});

gulp.task("example_sass", function () {
    gulp.src("./static/example.scss")
        .pipe(sass({ errLogToConsole: true }))
        .pipe(gulp.dest("./static"));
});

gulp.task("default", ["lib_ts", "sass", "example_sass"]);
