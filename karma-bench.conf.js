// Karma configuration
// Generated on Sun Mar 02 2014 22:17:49 GMT+0000 (GMT)

module.exports = function(config) {
  config.set({

    // base path, that will be used to resolve files and exclude
    basePath: '',


    // frameworks to use
    frameworks: ['jasmine', 'requirejs'],


    // list of files / patterns to load in the browser
    files: [
      'scripts/paths.require.js',
      {pattern: 'scripts/**/*.js', included: false},
      {pattern: 'test/benchmark/*.js', included: false},
      {pattern: 'test/benchmark/**/*.nmf', included: false},
      {pattern: 'test/benchmark/**/*.*exe', included: false, watched: false},
      {pattern: 'test/benchmark/**/*.js', included: false},
      {pattern: 'test/lib/**/*.js', included: false},
      'test/test-main.js'
    ],


    // list of files to exclude
    exclude: [
      'scripts/main.js',
      'test/node/**/*.js',
      'scripts/lib/**/*Spec.js' // exclude lib specs (not ours).
    ],


    // test results reporter to use
    // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
    reporters: ['dots'],


    // web server port
    port: 9875,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG

    logLevel: config.LOG_INFO,
    captureConsole: true,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera (has to be installed with `npm install karma-opera-launcher`)
    // - Safari (only Mac; has to be installed with `npm install karma-safari-launcher`)
    // - PhantomJS
    // - IE (only Windows; has to be installed with `npm install karma-ie-launcher`)
    browsers: ['chromenacl'],

    customLaunchers: {
      "chromenacl": {
        base: 'Chrome',
        flags: ['--no-sandbox', '--enable-benchmarking', '--enable-nacl', '--enable-pnacl']
      }
    },


    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 300000,
    browserDisconnectTimeout: 300000,
    browserNoActivityTimeout: 300000,


    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false
  });
};
