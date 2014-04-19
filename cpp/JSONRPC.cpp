#include "JSONRPC.h"
#include "ppapi/cpp/var.h"

JSONRPC::JSONRPC() {
}

//JSONRPC::JSONRPC(RPCTransport transport, RPCRuntime runtime) {
//}

JSONRPC::~JSONRPC() {
}

bool JSONRPC::is_basic_json_rpc(pp::Var obj) {
	return true;
}

bool JSONRPC::ValidateRPCRequest(pp::Var requestObj) {
	return true;
}

bool JSONRPC::ValidateRPCCallback(pp::Var callbackObj) {
	return true;
}

bool JSONRPC::ValidateRPCError(pp::Var errorObj) {
	return true;
}

void JSONRPC::HandleRPC(pp::Var rpcObj) {
	return;
}

void JSONRPC::SendRPCRequst(pp::Var rpcObj) {
	return;
}
