define(['NaClModule', 'lodash'], function(NaClModule, _){
	function RPCTransport(rpcModule, jsonRPC){
    if(_.isUndefined(rpcModule)) {
      throw new Error("NaClModule must be provided");
    }

    if(!_.isUndefined(jsonRPC)){
      // we were given a jsonRPC.
      this.jsonRPC = jsonRPC;
    }

    this.module = rpcModule;
    this.module.on("message", this.handleMessage, this);
	}

  RPCTransport.prototype.load = function(successCallback){
    this.module.load(function(){
      if(_.isFunction(successCallback)) successCallback.call(undefined);
    });
  };

  RPCTransport.prototype.send = function(data){
    var module = this.module;

    if(module.status === 0){ //0 means no-status
      module.load(function(){
        module.postMessage(data);
      });

    } else if(module.status === 1){ //1 means loaded.
      module.postMessage(data);

    } else { // any other status means we can't do the postmessage.
      return false;
    }

    return true;
  };

  RPCTransport.prototype.handleMessage = function(message){
    if(!_.isUndefined(this.jsonRPC)){
      this.jsonRPC.handleRPCCallback(message);
    }
  };


  RPCTransport.prototype.setJSONRPC = function(jsonRPC){
    this.jsonRPC = jsonRPC;
  };

	return RPCTransport;
});
