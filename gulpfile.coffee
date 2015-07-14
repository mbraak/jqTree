gulp       = require 'gulp'
coffee     = require 'gulp-coffee'
coffeeify  = require 'gulp-coffeeify'
coffeelint = require 'gulp-coffeelint'
exec       = require('child_process').exec
sass       = require('gulp-sass')

gulp.task 'jqtree', ->
    gulp.src './src/tree.jquery.coffee'
        .pipe coffeeify()
        .pipe gulp.dest('./')

gulp.task 'lib', ->
    gulp.src './src/*.coffee'
        .pipe coffee(bare: true)
        .pipe gulp.dest('./lib')

gulp.task 'build_test', ->
    gulp.src './src/test.js'
        .pipe coffeeify()
        .pipe gulp.dest('./test')

gulp.task 'jekyll', (cb) ->
    exec 'jekyll build', (err, stdout, stderr) ->
        console.log(stdout)
        console.log(stderr)
        cb(err)

gulp.task 'sass', ->
    gulp.src './jqtree.scss'
        .pipe sass(errLogToConsole: true)
        .pipe gulp.dest('./')

gulp.task 'lint', ->
    gulp.src './src/*.coffee'
        .pipe coffeelint()
        .pipe coffeelint.reporter()

gulp.task 'watch', ['default'], ->
    gulp.watch ['./src/*.coffee', './src/test.js', './jqtree.scss'], ['default']

gulp.task 'default', ['jqtree', 'build_test', 'lib', 'sass']
