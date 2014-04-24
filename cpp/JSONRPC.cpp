#include "JSONRPC.h"
#include "RPCTransport.h"
#include "ppapi/cpp/var.h"
#include "ppapi/cpp/var_array.h"
#include "ppapi/cpp/var_dictionary.h"

#include <string>

JSONRPC::JSONRPC() {
}

JSONRPC::JSONRPC(RPCTransport* transport) {
	setTransport(transport);
}

void JSONRPC::setTransport(RPCTransport* transport) {
	this->transport = transport;
	transport->setJSONRPC(this);
}

//JSONRPC::JSONRPC(RPCTransport transport, RPCRuntime runtime) {
//}

JSONRPC::~JSONRPC() {
}

bool JSONRPC::is_basic_json_rpc(const pp::Var& obj) {
	if(obj.is_dictionary()){
		pp::VarDictionary d(obj);
		return ((d.Get("jsonrpc").is_string() && d.Get("jsonrpc").AsString() == "2.0")
				&& ((d.Get("method").is_string()
						|| (d.HasKey("id") && (d.HasKey("result")
								|| d.Get("error").is_dictionary())))));
	}
	return false;
}

bool JSONRPC::ValidateRPCRequest(const pp::Var& requestObj) {
	if(is_basic_json_rpc(requestObj)){
		pp::VarDictionary d(requestObj);
		pp::Var id(d.Get("id"));
		return d.Get("method").is_string() && (id.is_undefined() || id.is_int() || id.is_string() || id.is_null());
	}
	return false;
}

bool JSONRPC::ValidateRPCCallback(const pp::Var& callbackObj) {
	if(is_basic_json_rpc(callbackObj)){
		pp::VarDictionary d(callbackObj);
		return d.HasKey("id") && d.HasKey("result") && !d.HasKey("error");
	}
	return false;
}

bool JSONRPC::ValidateRPCError(const pp::Var& errorObj) {
	if(is_basic_json_rpc(errorObj)){
		pp::VarDictionary d(errorObj);
		if(d.HasKey("id") && d.Get("error").is_dictionary() && !d.HasKey("result")){
			pp::VarDictionary e(d.Get("error"));
			return e.HasKey("code") && e.HasKey("message");
		}
	}
	return false;
}

void JSONRPC::HandleRPC(const pp::Var& rpcObj) {
	if(ValidateRPCRequest(rpcObj)){
		// todo call runtime
	} else if(ValidateRPCCallback(rpcObj)){
		// todo call runtime
	} else if(ValidateRPCError(rpcObj)){
		// todo call runtime
	} else {
		// not a JSON RPC.
	}
}

pp::VarDictionary JSONRPC::ConstructRPCRequest(std::string& method,
		unsigned int id, const pp::VarArray& params) {
	pp::VarDictionary obj;
	obj.Set("jsonrpc","2.0");
	obj.Set("method", method);
	obj.Set("params",params);
	obj.Set("id",(int)id);
	return obj;
}

pp::VarDictionary JSONRPC::ConstructRPCCallback(unsigned int id,
		pp::Var& result) {
	pp::VarDictionary obj;
	obj.Set("jsonrpc","2.0");
	obj.Set("result",result);
	obj.Set("id",(int)id);
	return obj;
}

pp::VarDictionary JSONRPC::ConstructRPCError(unsigned int id, int code,
		std::string& message, const pp::Var& data) {
	pp::VarDictionary obj = ConstructRPCError(id, code, message);
	pp::VarDictionary error_obj = pp::VarDictionary(obj.Get("error"));
	error_obj.Set("data", data);
	obj.Set("error", error_obj);
	return obj;
}

pp::VarDictionary JSONRPC::ConstructRPCError(unsigned int id, int code,
		std::string& message) {
	pp::VarDictionary obj;
	obj.Set("jsonrpc","2.0");
	pp::VarDictionary obj_error;
	obj_error.Set("code", code);
	obj_error.Set("message", message);
	obj.Set("error",obj_error);
	obj.Set("id",(int)id);

	return obj;
}


bool JSONRPC::SendRPCRequest(const pp::Var& rpcObj) {
	if(ValidateRPCRequest(rpcObj) && transport){
		transport->PostMessage(rpcObj);
		return true;
	} else {
		return false;
	}
}


