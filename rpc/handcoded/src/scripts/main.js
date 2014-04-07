requirejs.config({
  paths: REQUIRE_PATHS
});

require(["../Logger/LoggerRPCModule", "../Fib/FibRPCModule"], function(LoggerRPCModule, FibRPCModule) {

  window.Logger = LoggerRPCModule;
  window.Fib = FibRPCModule;

});