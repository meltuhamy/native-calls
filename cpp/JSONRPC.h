
#ifndef JSONRPC_H_
#define JSONRPC_H_
#include <string>
namespace pp{
class Var;
class VarArray;
class VarDictionary;
}



class RPCRuntime;
class RPCTransport;
class JSONRPC {
public:
	JSONRPC();
	JSONRPC(RPCTransport* transport);
//	JSONRPC(RPCTransport* transport, RPCRuntime* runtime);
	virtual ~JSONRPC();

	virtual bool is_basic_json_rpc(const pp::Var& obj);

	virtual bool ValidateRPCRequest(const pp::Var& requestObj);

	virtual bool ValidateRPCCallback(const pp::Var& callbackObj);

	virtual bool ValidateRPCError(const pp::Var& errorObj);

	virtual pp::VarDictionary ConstructRPCRequest(std::string& method, unsigned int id, const pp::VarArray& params);

	virtual pp::VarDictionary ConstructRPCCallback(unsigned int id, pp::Var& result);

	virtual pp::VarDictionary ConstructRPCError(unsigned int id, int code, std::string& message);
	virtual pp::VarDictionary ConstructRPCError(unsigned int id, int code, std::string& message, const pp::Var& data);

	virtual void HandleRPC(const pp::Var& rpcObj);

	virtual bool SendRPCRequest(const pp::Var& rpcObj);



	// getters and setters
	virtual const RPCTransport* getTransport() const {
		return transport;
	}

	virtual void setTransport(RPCTransport* transport);

//
//	virtual const RPCRuntime* getRuntime() const {
//		return runtime;
//	}
//
//	virtual void setRuntime(RPCRuntime* runtime) {
//		this->runtime = runtime;
//	}

private:
	RPCTransport *transport;
//	RPCRuntime *runtime;
};

#endif /* JSONRPC_H_ */
