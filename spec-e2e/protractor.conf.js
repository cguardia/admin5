// An example configuration file.
exports.config = {
    // The address of a running selenium server.
    seleniumAddress: 'http://localhost:4444/wd/hub',

    // Capabilities to be passed to the webdriver instance.
//    capabilities: {
//        'browserName': 'chrome'
//    },

    capabilities: {
        'browserName': 'phantomjs',

        // should be able to omit this property if phantomjs installed globally
        'phantomjs.binary.path': '../phantomjs/bin/phantomjs'
    },

    // URL of the app you want to test.
    baseUrl: 'http://localhost:8080/projects/karl/dev-buildout/src/admin5/admin5/app/app.html',

//    baseUrl: 'http://www.angularjs.org',

    // Spec patterns are relative to the location of the spec file. They may
    // include glob patterns.
    specs: [
        'test1.js'
    ],

    // Options to be passed to Jasmine-node.
    jasmineNodeOpts: {
        showColors: true, // Use colors in the command line report.
        isVerbose: true, // List all tests in the console
        includeStackTrace: true
    }
};