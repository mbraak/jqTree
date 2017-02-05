gulp   = require 'gulp'
coffee = require 'gulp-coffee'
fs     = require 'fs'
rename = require 'gulp-rename'
sass   = require 'gulp-sass'
ts     = require 'gulp-typescript'

gulp.task 'lib_coffee', ->
    gulp.src './src/*.coffee'
        .pipe coffee(bare: true)
        .pipe gulp.dest('./lib')

gulp.task 'lib_ts', ->
    gulp.src './src/*.ts'
        .pipe ts()
        .pipe gulp.dest('./lib')

gulp.task 'sass', ->
    gulp.src './jqtree.scss'
        .pipe sass(errLogToConsole: true)
        .pipe gulp.dest('./')

gulp.task 'example_sass', ->
    gulp.src './static/example.scss'
        .pipe sass(errLogToConsole: true)
        .pipe gulp.dest('./static')

gulp.task 'default', ['lib_coffee', 'lib_ts', 'sass', 'example_sass']
