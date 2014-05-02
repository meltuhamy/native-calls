#include "JSONRPC.h"
#include "RPCTransport.h"
#include "RPCRuntime.h"
#include "ppapi/cpp/var.h"
#include "ppapi/cpp/var_array.h"
#include "ppapi/cpp/var_dictionary.h"
#include "RPCRequest.h"

#include <string>
namespace pprpc{
JSONRPC::JSONRPC() {
}

JSONRPC::JSONRPC(RPCTransport* transport) {
	setTransport(transport);
}

JSONRPC::JSONRPC(RPCTransport* transport, RPCRuntime* runtime){
	setTransport(transport);
	setRuntime(runtime);
}

void JSONRPC::setTransport(RPCTransport* transport) {
	this->transport = transport;
	transport->setJSONRPC(this);
}


void JSONRPC::setRuntime(RPCRuntime* runtime) {
	this->runtime = runtime;
}

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

RPCRequest JSONRPC::ExtractRPCRequest(const pp::Var& requestObj) {
	pp::VarDictionary dict(requestObj);
	RPCRequest request(dict);
	if(ValidateRPCRequest(requestObj)){
		request.setValid(true);
	} else {
		request.setValid(false);
	}
	return request;
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
	RPCRequest r = ExtractRPCRequest(rpcObj);
	if(r.isValid){
		// todo call runtime
	} else if(ValidateRPCCallback(rpcObj)){
		// todo call runtime

	} else if(ValidateRPCError(rpcObj)){
		// todo call runtime
	} else {
		// not a JSON RPC.
	}
}

RPCRequest JSONRPC::ConstructRPCRequest(std::string& method,
		unsigned int id, const pp::VarArray& params) {
	return RPCRequest(method, params, id);
}

RPCRequest JSONRPC::ConstructRPCRequest(std::string& method, const pp::VarArray& params) {
	return RPCRequest(method, params);
}

RPCRequest JSONRPC::ConstructRPCRequest(std::string& method) {
	return RPCRequest(method);
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

bool JSONRPC::SendRPCCallback(const pp::Var& rpcObj) {
	if(ValidateRPCCallback(rpcObj) && transport){
		transport->PostMessage(rpcObj);
		return true;
	} else {
		return false;
	}
}

bool JSONRPC::SendRPCError(const pp::Var& rpcObj) {
	if(ValidateRPCError(rpcObj) && transport){
		transport->PostMessage(rpcObj);
		return true;
	} else {
		return false;
	}
}


} /*namespace pprpc*/
