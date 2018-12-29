const gulp = require("gulp");
const ts = require("gulp-typescript");

gulp.task("lib_ts", function(done) {
    const tsProject = ts.createProject("tsconfig.json");

    gulp.src("./src/*.ts")
        .pipe(tsProject())
        .pipe(gulp.dest("./lib"));

    done();
});

gulp.task("default", gulp.series("lib_ts"));
