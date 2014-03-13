requirejs.config({
  paths: REQUIRE_PATHS
});

require(["NaClModule", "EchoRPCStub"], function(NaClModule, EchoRPCStub) {
  // Does nothing, but just put it in here to get a feel of how it'll work.
  window.EchoRPC = new EchoRPCStub();

  var loggerModule = new NaClModule({
    "name": "logger",
    "src" : "../../rpc-module.nmf",
    "id": "loggerModule",
    "type": "application/x-pnacl"
  });

  loggerModule.load(function(){
    alert("logger loaded! Will send message next");
    loggerModule.postMessage({
      "json-rpc": "2.0",
      "method": "Echo",
      "params": ["hello world!"],
      "id" : 0
    });
  });

  loggerModule.on("message", function(message){
    alert("The result of echo('hello world') was: \n" + JSON.stringify(message.data.result[0]));
  });


});