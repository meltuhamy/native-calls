define(['RPCTransport', 'lodash', "TagLogger"], function(RPCTransport, _, TagLogger){
  var logger = new TagLogger("JSONRPC");
	function JSONRPC(rpcTransport, runtime){
    if(!_.isUndefined(rpcTransport)){
      this.transport = rpcTransport;
      rpcTransport.setJSONRPC(this);
    }

    if(!_.isUndefined(runtime)){
      this.runtime = runtime;
      runtime.setJSONRPC(this);
    }
	}

  function isBasicJSONRPC(rpcObject){
    return _.isObject(rpcObject) && _.isString(rpcObject.jsonrpc) &&
           (rpcObject.jsonrpc == "2.0") &&
           (_.isString(rpcObject.method) || !_.isUndefined(rpcObject.result) || _.isObject(rpcObject.error));
  }

  JSONRPC.prototype.getModule = function(){
    return this.transport.getModule();
  };

  JSONRPC.prototype.setTransport = function(transport){
    this.transport = transport;
  };

  JSONRPC.prototype.setRuntime = function(runtime){
    this.runtime = runtime;
  };

  /**
   * Checks that the given object is a valid JSON RPC request,
   * as defined in the specification http://www.jsonrpc.org/specification#request_object
   * @param rpcObject
   * @returns Boolean True if valid json rpc request, false otherwise.
   */
  JSONRPC.prototype.validateRPCRequest = function(rpcObject){
    var method = rpcObject.method,
        id     = rpcObject.id;

    return isBasicJSONRPC(rpcObject) &&           // the object needs to be a json-rpc 2.0 object.
           _.isString(method) &&                  // the method has to be defined and a string
          ( _.isUndefined(id) ||                  // the id could be left out, or:
          (_.isNumber(id) && id === (id|0)) ||    // the id could be a number that is an integer
          _.isString(id) ||                       // the id could be a string
          _.isNull(id));                          // the id could be 'null'.
  };

  /**
   * Checks that the given object is a valid JSON RPC callback,
   * as defined in the specification http://www.jsonrpc.org/specification#response_object
   * Note that a callback is different from a response. Responses could be callbacks or errors.
   * @param rpcObject
   * @returns boolean
   */
  JSONRPC.prototype.validateRPCCallback = function(rpcObject){
    return isBasicJSONRPC(rpcObject) &&          // must be a json rpc 2.0 object
           !_.isUndefined(rpcObject.result) &&   // a callback must be a result
           _.isUndefined(rpcObject.error) &&     // a callback can't be an error
           !_.isUndefined(rpcObject.id);         // a callback must have an id
  };

  /**
   * Checks that the given object is a valid JSON RPC error,
   * as defined in the specification http://www.jsonrpc.org/specification#response_object
   * @param rpcObject
   * @returns boolean
   */
  JSONRPC.prototype.validateRPCError = function(rpcObject){
    var errorObject = rpcObject.error;
    return isBasicJSONRPC(rpcObject) &&          // must be a json rpc 2.0 object
           !_.isUndefined(rpcObject.id) &&       // must have an id
           _.isObject(errorObject) &&            // must have an error object
           _.isUndefined(rpcObject.result) &&    // can't have a result
           !_.isUndefined(errorObject.code) &&   // must have an error code
           !_.isUndefined(errorObject.message);  // must have an error message
  };

  /**
   * Handles onMessage events by checking whether it is an rpc call, a callback or an error.
   * Calls RPC Runtime methods.
   * @returns {boolean}
   * @param eventObject
   */
  JSONRPC.prototype.handleRPC = function(eventObject){
    var rpcObject = eventObject.data;

    if(this.validateRPCCallback(rpcObject)){
      // it's a successful response that is a callback
      if(!_.isUndefined(this.runtime)){
        this.runtime.handleCallback(rpcObject);
        return true;
      } else {
        console.error("JSONRPC received callback response but no runtime is set to handle it.");
        return false;
      }

    } else if(this.validateRPCError(rpcObject)){
      // it's a "successful" response that is an error
      if(!_.isUndefined(this.runtime)){
        this.runtime.handleError(rpcObject);
        return true;
      } else {
        console.error("JSONRPC received error response but no runtime is set to handle it.");
        return false;
      }
    } else if (this.validateRPCRequest(rpcObject)){
      // it's a rpc call
      logger.debug("Received request", rpcObject);
      if(!_.isUndefined(this.runtime)){
        this.runtime.handleRequest(rpcObject);
        return true;
      } else {
        console.error("JSONRPC received rpc request but no runtime is set to handle it.");
        return false;
      }
    } else{
      // it's not a rpc response.
      logger.warn("Received non-rpc message", rpcObject);
      return false;
    }
  };

  /**
   * Validates that the object that is about to be sent is a valid json rpc request. If it is, the message is sent.
   * @param rpcObject
   * @returns {*}
   */
  JSONRPC.prototype.sendRPCRequest = function(rpcObject){
    if(!_.isUndefined(this.transport)){
      if(this.validateRPCRequest(rpcObject)){
        return this.transport.send(rpcObject);
      } else {
        logger.warn("Failed to send rpc object because it is invalid");
        // might be better doing an error callback.
        return false;
      }
    } else {
      throw new Error("Transport required for sending json rpc");
    }

  };

  JSONRPC.prototype.constructRPCRequest = function(method, id, params){
    return {
      "jsonrpc": "2.0",
      "method": method,
      "id": id,
      "params": params
    };
  };

  JSONRPC.prototype.constructRPCCallback = function(id, result){
    return {
      "jsonrpc": "2.0",
      "id": id,
      "result": result
    };
  };

  JSONRPC.prototype.constructRPCError = function(id, code, message, data){
    return {
      "jsonrpc": "2.0",
      "id": id,
      "error": {
        "code": code,
        "message": message,
        "data": data
      }
    };
  };

	return JSONRPC;
});
