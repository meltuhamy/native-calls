#include "JSONRPC.h"
#include "RPCTransport.h"
#include "ppapi/cpp/var.h"
#include "ppapi/cpp/var_array.h"
#include "ppapi/cpp/var_dictionary.h"

#include <string>

JSONRPC::JSONRPC() {
}

JSONRPC::JSONRPC(RPCTransport* transport) {
	this->transport = transport;
	this->transport->setJSONRPC(this);
}


//JSONRPC::JSONRPC(RPCTransport transport, RPCRuntime runtime) {
//}

JSONRPC::~JSONRPC() {
}

bool JSONRPC::is_basic_json_rpc(const pp::Var& obj) {
	return true;
}

bool JSONRPC::ValidateRPCRequest(const pp::Var& requestObj) {
	return true;
}

bool JSONRPC::ValidateRPCCallback(const pp::Var& callbackObj) {
	return true;
}

bool JSONRPC::ValidateRPCError(const pp::Var& errorObj) {
	return true;
}

void JSONRPC::HandleRPC(const pp::Var& rpcObj) {
	return;
}

pp::VarDictionary JSONRPC::ConstructRPCRequest(std::string& method,
		unsigned int id, const pp::VarArray& params) {
	pp::VarDictionary d;
	return d;
}

pp::VarDictionary JSONRPC::ConstructRPCCallback(unsigned int id,
		pp::Var& result) {
	pp::VarDictionary d;
	return d;
}

pp::VarDictionary JSONRPC::ConstructRPCError(unsigned int id, int code,
		std::string& message, const pp::Var& data) {
	pp::VarDictionary d = ConstructRPCError(id, code, message);
	// todo: set data.
	return d;
}

pp::VarDictionary JSONRPC::ConstructRPCError(unsigned int id, int code,
		std::string& message) {
	pp::VarDictionary d;
	return d;
}


bool JSONRPC::SendRPCRequest(const pp::Var& rpcObj) {
	return true;
}

