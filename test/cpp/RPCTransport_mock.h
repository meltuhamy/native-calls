#include "gmock/gmock.h"
#include "ppapi/cpp/var.h"
#include "RPCTransport.h"

using namespace pprpc;
class MockRPCTransport: public RPCTransport{
public:
	MockRPCTransport() : RPCTransport(123){}
	MOCK_METHOD1(HandleMessage, void(const pp::Var& message));
	MOCK_METHOD1(PostMessage, void(const pp::Var& message));
	MOCK_METHOD1(setJSONRPC, void(JSONRPC*));
};
