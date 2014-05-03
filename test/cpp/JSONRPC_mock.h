#include "gmock/gmock.h"
#include "JSONRPC.h"
#include "ppapi/cpp/var.h"
#include "ppapi/cpp/var_array.h"
#include "ppapi/cpp/var_dictionary.h"
#include "RPCRequest.h"

using namespace pprpc;
using ::testing::Invoke;
using ::testing::_;
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

	void DelegateToRealValidators() {
		ON_CALL(*this, is_basic_json_rpc(_)).WillByDefault(Invoke(&real_, &JSONRPC::is_basic_json_rpc));
		ON_CALL(*this, ValidateRPCRequest(_)).WillByDefault(Invoke(&real_, &JSONRPC::ValidateRPCRequest));
		ON_CALL(*this, ValidateRPCCallback(_)).WillByDefault(Invoke(&real_, &JSONRPC::ValidateRPCCallback));
		ON_CALL(*this, ValidateRPCError(_)).WillByDefault(Invoke(&real_, &JSONRPC::ValidateRPCError));
//		ON_CALL(*this, ConstructRPCRequest(_,_,_)).WillByDefault(Invoke(&real_, &JSONRPC::ConstructRPCRequest)); //not sure why no compile :(
		ON_CALL(*this, ConstructRPCCallback(_,_)).WillByDefault(Invoke(&real_, &JSONRPC::ConstructRPCCallback));
//		ON_CALL(*this, ConstructRPCError(_,_,_,_)).WillByDefault(Invoke(&real_, &JSONRPC::ConstructRPCError)); //not sure why no compile :(
	}

private:
	JSONRPC real_;
};
