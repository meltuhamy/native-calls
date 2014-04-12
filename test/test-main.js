var tests = [];
for (var file in window.__karma__.files) {
  if (window.__karma__.files.hasOwnProperty(file)) {
    if (/Spec\.js$/.test(file)) {
      tests.push(file);
    }
  }
}

//extra paths we use in our testing environment only
REQUIRE_PATHS['fakemodule'] = '/base/test/lib/fakemodule';

requirejs.config({
  // Karma serves files from '/base'
  baseUrl: '/base/scripts',
  paths: REQUIRE_PATHS,
  shim: {
  },

  // ask Require.js to load these files (all our tests)
  deps: tests,

  // start test run, once Require.js is done
  callback: window.__karma__.start
});

require(['loglevel'], function(loglevel){
  // disable logging while testing
  loglevel.disableAll();
});