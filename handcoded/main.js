requirejs.config({
  baseUrl: '../scripts',
  paths: REQUIRE_PATHS
});
var DEMOPREFIX = '../handcoded/'; //relative to requirejs baseurl

require(["tv4", "loglevel", DEMOPREFIX+"Fib/FibRPC", "../scripts/JSFib"], function(tv4, loglevel, FibRPCModule, JSFib) {
  window.loglevel = loglevel;
  window.tv4 = tv4;
  loglevel.setLevel(loglevel.levels.DEBUG); //log everything when debugging!
  window.Fib = FibRPCModule.Fib;
  window.JSFib = JSFib;

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