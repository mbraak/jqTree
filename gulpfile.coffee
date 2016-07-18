gulp       = require 'gulp'
coffee     = require 'gulp-coffee'
coffeeify  = require 'gulp-coffeeify'
coffeelint = require 'gulp-coffeelint'
exec       = require('child_process').exec
fs         = require 'fs'
header     = require 'gulp-header'
rename     = require 'gulp-rename'
sass       = require 'gulp-sass'

pkg = require './package.json'


gulp.task 'jqtree', ->
    banner = fs.readFileSync('src/header.txt')

    gulp.src './src/tree.jquery.coffee'
        .pipe coffeeify()
        .pipe header(banner, pkg: pkg)
        .pipe gulp.dest('./')

gulp.task 'lib', ->
    gulp.src './src/*.coffee'
        .pipe coffee(bare: true)
        .pipe gulp.dest('./lib')

gulp.task 'build_test', ->
    gulp.src './src_test/test.js'
        .pipe coffeeify()
        .pipe rename('test_build.js')
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

gulp.task 'example_sass', ->
    gulp.src './static/example.scss'
        .pipe sass(errLogToConsole: true)
        .pipe gulp.dest('./static')

gulp.task 'lint', ->
    gulp.src './src/*.coffee'
        .pipe coffeelint()
        .pipe coffeelint.reporter()

gulp.task 'watch', ['default'], ->
    gulp.watch ['./src/*.coffee', './src/test.js', './jqtree.scss', './static/example.scss'], ['default']

gulp.task 'default', ['jqtree', 'build_test', 'lib', 'sass', 'example_sass']
