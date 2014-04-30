#ifndef RPCTRANSPORT_H_
#define RPCTRANSPORT_H_
#include <ppapi/cpp/instance.h>
namespace pp{
class Var;
}


namespace pprpc{
class JSONRPC;

class RPCTransport : public pp::Instance{
public:
	RPCTransport(PP_Instance instance);

	RPCTransport(PP_Instance instance, JSONRPC *jsonRPC);

	virtual void HandleMessage(const pp::Var& message);

	virtual void PostMessage(const pp::Var& message);

	virtual ~RPCTransport();

	virtual JSONRPC* getJSONRPC() {
		return jsonRPC;
	}

	virtual void setJSONRPC(JSONRPC* jsonRpc) {
		jsonRPC = jsonRpc;
	}

private:
	JSONRPC *jsonRPC;

	void init();
	void init(JSONRPC *jsonRPC);
};


} /*namespace pprpc*/
#endif /* RPCTRANSPORT_H_ */
