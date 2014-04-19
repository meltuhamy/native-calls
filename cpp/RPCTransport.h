#ifndef RPCTRANSPORT_H_
#define RPCTRANSPORT_H_
#include <ppapi/cpp/instance.h>
namespace pp{
class Var;
}

class JSONRPC;

class RPCTransport : public pp::Instance{
public:
	RPCTransport(PP_Instance instance);

	RPCTransport(PP_Instance instance, JSONRPC *jsonRPC);

	virtual void HandleMesasge(const pp::Var& message);

	virtual ~RPCTransport();

	JSONRPC* getJSONRPC() {
		return jsonRPC;
	}

	void setJSONRPC(JSONRPC* jsonRpc) {
		jsonRPC = jsonRpc;
	}

private:
	JSONRPC *jsonRPC;

	void init();
	void init(JSONRPC *jsonRPC);
};

#endif /* RPCTRANSPORT_H_ */
