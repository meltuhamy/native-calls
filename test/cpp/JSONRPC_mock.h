#include "gmock/gmock.h"
#include "JSONRPC.h"
#include "ppapi/cpp/var.h"

class MockJSONRPC: public JSONRPC {
public:

	MOCK_METHOD1(is_basic_json_rpc, bool(pp::Var obj));
	MOCK_METHOD1(ValidateRPCRequest, bool(pp::Var obj));
	MOCK_METHOD1(ValidateRPCCallback, bool(pp::Var obj));
	MOCK_METHOD1(ValidateRPCError, bool(pp::Var obj));
	MOCK_METHOD1(HandleRPC, void(pp::Var obj));
	MOCK_METHOD1(SendRPCRequst, void(pp::Var obj));

};
