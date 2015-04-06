// Karma configuration
// Generated on Mon Nov 24 2014 14:20:45 GMT+0100 (CET)

module.exports = function(config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',

        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['browserify', 'qunit'],

        // list of files / patterns to load in the browser
        files: [
            'src/karma-test.js',
            'static/bower_components/json3/lib/json3.js'
        ],

        // list of files to exclude
        exclude: [
        ],

        preprocessors: {
            'src/karma-test.js': ['browserify']
        },

        browserify: {
            transform: ['coffeeify'],
            extensions: ['.js', '.coffee']
        },

        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['progress'],

        // web server port
        port: 9876,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,

        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['Chrome', 'Firefox', 'PhantomJS', 'IE7 - WinXP'],

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: false
    });
};
