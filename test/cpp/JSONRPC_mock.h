#include "gmock/gmock.h"
#include "JSONRPC.h"
#include "ppapi/cpp/var.h"
#include "ppapi/cpp/var_array.h"
#include "ppapi/cpp/var_dictionary.h"
#include "RPCRequest.h"

using namespace pprpc;

class MockJSONRPC: public JSONRPC {
public:
	MOCK_METHOD1(is_basic_json_rpc, bool(const pp::Var& obj));
	MOCK_METHOD1(ValidateRPCRequest, bool(const pp::Var& obj));
	MOCK_METHOD1(ValidateRPCCallback, bool(const pp::Var& obj));
	MOCK_METHOD1(ValidateRPCError, bool(const pp::Var& obj));
	MOCK_METHOD1(HandleRPC, void(const pp::Var& obj));
	MOCK_METHOD1(SendRPCRequest, bool(const pp::Var& obj));
	MOCK_METHOD1(SendRPCCallback, bool(const pp::Var& obj));
	MOCK_METHOD1(SendRPCError, bool(const pp::Var& obj));
	MOCK_METHOD3(ConstructRPCRequest, RPCRequest(std::string& method, unsigned int id, const pp::VarArray& params));
	MOCK_METHOD2(ConstructRPCCallback, pp::VarDictionary(unsigned int id, pp::Var& result));
	MOCK_METHOD4(ConstructRPCError, pp::VarDictionary(unsigned int id, int code, std::string& message, const pp::Var& data));

	void HandleRPC_concrete(const pp::Var& obj){
		JSONRPC::HandleRPC(obj);
	}
};
