requirejs.config({
  paths: REQUIRE_PATHS
});

require(["EchoRPCModule"], function(EchoRPCModule) {

  window.EchoRPCModule = EchoRPCModule;

});