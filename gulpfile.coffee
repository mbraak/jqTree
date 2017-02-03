gulp   = require 'gulp'
coffee = require 'gulp-coffee'
fs     = require 'fs'
rename = require 'gulp-rename'
sass   = require 'gulp-sass'


gulp.task 'lib', ->
    gulp.src './src/*.coffee'
        .pipe coffee(bare: true)
        .pipe gulp.dest('./lib')

gulp.task 'sass', ->
    gulp.src './jqtree.scss'
        .pipe sass(errLogToConsole: true)
        .pipe gulp.dest('./')

gulp.task 'example_sass', ->
    gulp.src './static/example.scss'
        .pipe sass(errLogToConsole: true)
        .pipe gulp.dest('./static')

gulp.task 'default', ['lib', 'sass', 'example_sass']
