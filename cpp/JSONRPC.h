
#ifndef JSONRPC_H_
#define JSONRPC_H_
#include <string>
namespace pp{
class Var;
class VarArray;
class VarDictionary;
}


namespace pprpc{
class RPCRuntime;
class RPCTransport;
class RPCRuntime;
class RPCRequest;
class JSONRPC {
public:
	JSONRPC();
	JSONRPC(RPCTransport* transport);
	JSONRPC(RPCTransport* transport, RPCRuntime* runtime);

	virtual ~JSONRPC();

	virtual bool is_basic_json_rpc(const pp::Var& obj);

	virtual bool ValidateRPCRequest(const pp::Var& requestObj);
	RPCRequest ExtractRPCRequest(const pp::Var& requestObj);

	virtual bool ValidateRPCCallback(const pp::Var& callbackObj);

	virtual bool ValidateRPCError(const pp::Var& errorObj);

	virtual RPCRequest ConstructRPCRequest(std::string& method, unsigned int id, const pp::VarArray& params);
	virtual RPCRequest ConstructRPCRequest(std::string& method, const pp::VarArray& params);
	virtual RPCRequest ConstructRPCRequest(std::string& method);

	virtual pp::VarDictionary ConstructRPCCallback(unsigned int id, pp::Var& result);

	virtual pp::VarDictionary ConstructRPCError(unsigned int id, int code, std::string& message);
	virtual pp::VarDictionary ConstructRPCError(unsigned int id, int code, std::string& message, const pp::Var& data);

	virtual void HandleRPC(const pp::Var& rpcObj);

	virtual bool SendRPCRequest(const pp::Var& rpcObj);
	virtual bool SendRPCCallback(const pp::Var& rpcObj);
	virtual bool SendRPCError(const pp::Var& rpcObj);



	// getters and setters
	virtual const RPCTransport* getTransport() const {
		return transport;
	}

	virtual void setTransport(RPCTransport* transport);


	virtual RPCRuntime* getRuntime() const {
		return runtime;
	}
	virtual void setRuntime(RPCRuntime* runtime);

private:
	RPCTransport *transport;
	RPCRuntime *runtime;
	bool transportSet;
	bool runtimeSet;
};
}

#endif /* JSONRPC_H_ */
