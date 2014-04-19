
#ifndef JSONRPC_H_
#define JSONRPC_H_
class RPCRuntime;
class RPCTransport;
class JSONRPC {
public:
	JSONRPC();
	JSONRPC(RPCTransport transport, RPCRuntime runtime);
	virtual ~JSONRPC();

	bool is_basic_json_rpc(pp::Var obj);

	bool ValidateRPCRequest(pp::Var requestObj);

	bool ValidateRPCCallback(pp::Var callbackObj);

	bool ValidateRPCError(pp::Var errorObj);

	void HandleRPC(pp::Var rpcObj);

	void SendRPCRequst(pp::Var rpcObj);



	// getters and setters
	const RPCTransport* getTransport() const {
		return transport;
	}

	void setTransport(RPCTransport* transport) {
		this->transport = transport;
	}

	const RPCRuntime* getRuntime() const {
		return runtime;
	}

	void setRuntime(RPCRuntime* runtime) {
		this->runtime = runtime;
	}

private:
	RPCTransport *transport;
	RPCRuntime *runtime;
};

#endif /* JSONRPC_H_ */
