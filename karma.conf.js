// Karma configuration
// Generated on Tue Nov 26 2013 16:25:36 GMT-0500 (EST)

module.exports = function (config) {
    config.set(
        {
            // base path, that will be used to resolve files and exclude
            basePath: 'admin5/app',
            logLevel: config.LOG_INFO,

            // frameworks to use
            frameworks: ['jasmine'],

            // list of files / patterns to load in the browser
            files: [
                '../../bower_components/angular/angular.js',
                '../../bower_components/angular-mocks/angular-mocks.js',
                "traverser.js",
                '../../tests/*Specs.js'
            ],

            // list of files to exclude
            exclude: [],

            browsers: ['PhantomJS'],
//            browsers: ['Chrome'],

            // If browser does not capture in given timeout [ms], kill it
            captureTimeout: 60000

        });
};
