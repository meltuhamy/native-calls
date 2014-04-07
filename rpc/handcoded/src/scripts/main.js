requirejs.config({
  paths: REQUIRE_PATHS
});

require(["../Logger/LoggerRPCModule"], function(LoggerRPCModule) {

  window.Logger = LoggerRPCModule;

});