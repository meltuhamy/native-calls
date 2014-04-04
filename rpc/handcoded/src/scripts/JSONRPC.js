define(['RPCTransport'], function(RPCTransport){
	function JSONRPC(rpcTransport){
    if(!_.isUndefined(rpcTransport)){
      this.transport = rpcTransport;
      rpcTransport.setJSONRPC(this);
    }
	}

  JSONRPC.prototype.validateRPCRequest = function(rpcObject){

  };

  JSONRPC.prototype.validateRPCCallback = function(rpcObject){

  };

  JSONRPC.prototype.handleRPCCallback = function(rpcObject){

  };

  JSONRPC.prototype.sendRPCRequest = function(rpcObject){

  };

	return JSONRPC;
});
