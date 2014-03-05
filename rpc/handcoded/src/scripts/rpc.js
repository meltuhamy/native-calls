define(["common", "rpc-send", "rpc-receive"],function(common, RPCSendFunctions, RPCReceiveFunctions){
  return {
    moduleDidLoad: function(){
      common.hideModule();
      common.naclModule.postMessage('hello');
    },
    handleMessage: function(message){
      // console.log(message.data);
      d = message.data;
      if(d.jsonrpc != undefined && d.jsonrpc == "2.0"){
        // We called NaCl and we got a response...
        if(d.result != undefined && d.id != undefined){
          // look up id's context callback
          var callbacks = RPCSendFunctions.RPCCallbacks;
          if(callbacks[d.id] != undefined){
            callbacks[d.id].apply(this, d.result);
            callbacks[d.id] = undefined;
            delete(callbacks[d.id]);
          }
        }
        // NaCl called us...
        if (d.method != undefined && RPCReceiveFunctions[d.method] != undefined && d.params != undefined) {
          RPCReceiveFunctions[d.method].apply(this, d.params);
        };
      }
    }
  }
});
