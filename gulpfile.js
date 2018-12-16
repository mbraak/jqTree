const gulp = require("gulp");
const sass = require("gulp-sass");
const ts = require("gulp-typescript");

gulp.task("lib_ts", function(done) {
    const tsProject = ts.createProject("tsconfig.json");

    gulp.src("./src/*.ts")
        .pipe(tsProject())
        .pipe(gulp.dest("./lib"));

    done();
});

gulp.task("sass", function(done) {
    gulp.src("./jqtree.scss")
        .pipe(sass({ errLogToConsole: true }))
        .pipe(gulp.dest("./"));

    done();
});

gulp.task("example_sass", function(done) {
    gulp.src("./static/example.scss")
        .pipe(sass({ errLogToConsole: true }))
        .pipe(gulp.dest("./static"));

    done();
});

gulp.task("default", gulp.series("lib_ts", "sass", "example_sass"));
