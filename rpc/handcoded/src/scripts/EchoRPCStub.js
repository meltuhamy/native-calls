// Later, the generator will generate something like this using the IDL file.
define(['RPCStub', 'RPCRuntime', 'lodash'], function(RPCStub, RPCRuntime, _){
	// Inherits from RPCStub
	EchoRPCStub.prototype = new RPCStub();	
	EchoRPCStub.prototype.constructor = EchoRPCStub;
	EchoRPCStub.prototype._super = RPCStub.prototype;

	function EchoRPCStub(rpcRuntime){

	};

	EchoRPCStub.prototype.Echo = function(data, callback){
		// TODO: Do the actual RPC call. For now, we dummy it.
		if(_.isFunction(callback)){
			callback.call(this, data);
		}
	};
	return EchoRPCStub;
});
