requirejs.config({
  baseUrl: '../scripts',
  paths: REQUIRE_PATHS
});
var DEMOPREFIX = '../handcoded/'; //relative to requirejs baseurl

require(["loglevel", DEMOPREFIX+"Logger/LoggerRPC", DEMOPREFIX+"Fib/FibRPC", DEMOPREFIX+"ObjectsExample/ObjectsExampleRPC", "../scripts/JSFib"], function(loglevel, LoggerRPCModule, FibRPCModule, ObjectsExampleModule, JSFib) {
  window.loglevel = loglevel;
  loglevel.setLevel(loglevel.levels.DEBUG); //log everything when debugging!
  window.Logger = LoggerRPCModule;
  window.Fib = FibRPCModule;
  window.JSFib = JSFib;
  window.ObjectsExample = ObjectsExampleModule;


  window.timeJSFib = function(x){
    var jsStart = new Date();
    JSFib.fib(x, function(result){
      var duration = (new Date()) - jsStart;
      console.log("JS : fib("+x+") = "+result+"; Took "+duration+" ms.");
    });
  };

  window.timeCPPFib = function(x){
    var cppStart = new Date();
    Fib.fib(x, function(result){
      var duration = (new Date()) - cppStart;
      console.log("C++: fib("+x+") = "+result+"; Took "+duration+" ms.");
    });
  };


  window.compareJSCPP = function(x){
    window.timeJSFib(x);
    window.timeCPPFib(x);
  };

});