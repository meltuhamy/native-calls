
#ifndef JSONRPC_H_
#define JSONRPC_H_
namespace pp{
class Var;
}

class JSONRPC {
public:
	JSONRPC();
//	JSONRPC(RPCTransport transport, RPCRuntime runtime);
	virtual ~JSONRPC();

	virtual bool is_basic_json_rpc(pp::Var obj);

	virtual bool ValidateRPCRequest(pp::Var requestObj);

	virtual bool ValidateRPCCallback(pp::Var callbackObj);

	virtual bool ValidateRPCError(pp::Var errorObj);

	virtual void HandleRPC(pp::Var rpcObj);

	virtual void SendRPCRequst(pp::Var rpcObj);



	// getters and setters
//	virtual const RPCTransport* getTransport() const {
//		return transport;
//	}
//
//	virtual void setTransport(RPCTransport* transport) {
//		this->transport = transport;
//	}
//
//	virtual const RPCRuntime* getRuntime() const {
//		return runtime;
//	}
//
//	virtual void setRuntime(RPCRuntime* runtime) {
//		this->runtime = runtime;
//	}

private:
//	RPCTransport *transport;
//	RPCRuntime *runtime;
};

#endif /* JSONRPC_H_ */
