requirejs.config({
  paths: REQUIRE_PATHS
});

require(["NaClModule"], function(NaClModule) {
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