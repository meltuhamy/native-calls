requirejs.config({
  paths: REQUIRE_PATHS
});

require(["loglevel", "../Logger/LoggerRPCModule", "../Fib/FibRPCModule", "../ObjectsExample/ObjectsExampleRPCModule", "JSFib",], function(loglevel, LoggerRPCModule, FibRPCModule, ObjectsExampleModule, JSFib) {
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