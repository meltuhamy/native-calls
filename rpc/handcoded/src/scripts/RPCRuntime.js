define(['JSONRPC'], function(JSONRPC){
	function RPCRuntime(jsonRPC){
		if(!_.isUndefined(jsonRPC)){
      this.setJSONRPC(jsonRPC);
    } else {
      throw new Error("A JSONRPC layer must be provided");
    }

    this.idCallbackMap = Object.create(null); //a pure map
    this.nextFreeId = 0;
	}


  RPCRuntime.prototype.setJSONRPC = function(jsonRPC){
    this.jsonRPC = jsonRPC;
    this.jsonRPC.setRuntime(this);
  };


  RPCRuntime.prototype.sendRequest = function(method, paramaters, successCB, errorCB){
    var thisRequestId = ++this.nextFreeId;
    this.idCallbackMap[thisRequestId] = {success: successCB, error: errorCB};
    var jsonRequest = this.jsonRPC.constructRPCRequest(method, thisRequestId, paramaters);

    if(this.jsonRPC.validateRPCRequest(jsonRequest)){
      // good to go
      this.jsonRPC.sendRPCRequest(jsonRequest);
    } else {
      // error!
      var error = this.ERRORS.InvalidRequest;
      this.handleError(this.jsonRPC.constructRPCError(thisRequestId, error.code, error.message, jsonRequest));
    }

    return thisRequestId;
  };


  RPCRuntime.prototype.sendCallback = function(id, result){
    // TODO C++ - JS RPC
  };


  RPCRuntime.prototype.sendError = function(id, errorCode, errorMessage, errorData){
    // TODO C++ - JS RPC

  };


  RPCRuntime.prototype.handleRequest = function(rpcObject){
    // TODO C++ - JS RPC
  };


  RPCRuntime.prototype.handleCallback = function(rpcObject){
    // see if that id is even registered with us
    if(_.isUndefined(this.idCallbackMap[rpcObject.id])){
      console.error("Received a callback response for a call that hasn't been made");
      return false;
    }

    // get the success callback
    var successCallback = this.idCallbackMap[rpcObject.id].success;

    // call it
    if(_.isFunction(successCallback)){
      successCallback.call(null, rpcObject.result);
    }

    // delete it from the map
    this.idCallbackMap[rpcObject.id] = undefined;
    delete(this.idCallbackMap[rpcObject.id]);

    return true;
  };


  RPCRuntime.prototype.handleError = function(rpcObject){
    // see if that id is even registered with us
    var id = rpcObject.id;
    if(_.isUndefined(this.idCallbackMap[id])){
      console.error("Received a error response for a call that hasn't been made");
      return false;
    }

    // get the info.
    var errorInfo = rpcObject.error;

    // get the error callback
    var errorCB = this.idCallbackMap[id].error;

    // call it
    if(_.isFunction(errorCB)){
      errorCB.call(null, errorInfo);
    }

    // remove it from the map
    this.idCallbackMap[id] = undefined;
    delete(this.idCallbackMap[id]);

    return true;

  };

  RPCRuntime.prototype.ERRORS = Object.create(null);
  RPCRuntime.prototype.ERRORS["ParseError"]     = RPCRuntime.prototype.ERRORS[-32700] = {code: -32700, message: "Parse error"};
  RPCRuntime.prototype.ERRORS["InvalidRequest"] = RPCRuntime.prototype.ERRORS[-32600] = {code: -32600, message: "Invalid Request"};
  RPCRuntime.prototype.ERRORS["MethodNotFound"] = RPCRuntime.prototype.ERRORS[-32601] = {code: -32601, message: "Method not found"};
  RPCRuntime.prototype.ERRORS["InvalidParams"]  = RPCRuntime.prototype.ERRORS[-32602] = {code: -32602, message: "Invalid params"};
  RPCRuntime.prototype.ERRORS["InternalError"]  = RPCRuntime.prototype.ERRORS[-32603] = {code: -32603, message: "Internal error"};


  return RPCRuntime;
});
