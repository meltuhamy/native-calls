#include "RPCRuntime.h"
#include "JSONRPC.h"
#include "ppapi/cpp/var.h"
#include "ppapi/cpp/var_array.h"
#include "ppapi/cpp/var_dictionary.h"
#include <map>
#include <string>
#include <stdio.h>
#include "RPCRequest.h"
#include "RPCType.h"

namespace pprpc{

pp::Var RPCServerStub::call(const pp::VarArray* params, RPCError& error) {
	return pp::Var(); //return undefined by default.
}






RPCRuntime::~RPCRuntime() {
	// fprintf(stdout, "\nRPCRuntime::~RPCRuntime()\n");
}

RPCRuntime::RPCRuntime(JSONRPC* jsonRPC) {
	this->jsonRPC = jsonRPC;
	this->jsonRPC->setRuntime(this);
	this->functorMap = new std::map<std::string, RPCServerStub*>();
}

bool RPCRuntime::AddFunctor(std::string name, RPCServerStub* functor) {
	if(functorMap->find(name) == functorMap->end()){
		functorMap->insert(std::pair<std::string,RPCServerStub*>(name, functor));
		return true;
	}
	return false;
}


RPCServerStub* RPCRuntime::GetFunctor(std::string name) {
	std::map<std::string, RPCServerStub*>::const_iterator pos = functorMap->find(name);
	if(pos == functorMap->end()){
		// not found
		RPCServerStub* invalid = new RPCServerStub();
		invalid->setValid(false);
		return invalid;
	} else {
		pos->second->setValid(true);
		return pos->second;
	}
}

pp::Var RPCRuntime::CallFunctor(std::string name, const pp::VarArray* params, RPCError& error) {
	pp::Var returnValue; //default undefined
	RPCServerStub* functor = GetFunctor(name);
	if(functor->isValid()){
		returnValue = functor->call(params, error);
	} else {
		error.init(-32601, "Method not found", "");
	}
	return returnValue;
}

bool RPCRuntime::HandleRequest(const pp::Var& requestVar) {
	return HandleRequest(RPCRequest(pp::VarDictionary(requestVar)));
}

bool RPCRuntime::HandleRequest(const RPCRequest& request) {
	RPCError runtimeError; // by default, code == 0 == no error
	bool valid = request.isValid();
	if(valid){
		// if an id was given, do a callback
		pp::Var returned = CallFunctor(request.getMethod(), request.getParams(), runtimeError);

		if(request.isHasId()){
			//if an id was given, do a callback
			if(runtimeError.code != 0){
				// todo support custom error data.
				jsonRPC->SendRPCError(jsonRPC->ConstructRPCError(request.getId(), runtimeError.code, runtimeError.message));
				return false;
			} else {
				return jsonRPC->SendRPCCallback(jsonRPC->ConstructRPCCallback(request.getId(), returned));
			}
		}

		return true;

	} else {
		// invalid request!
		if(request.isHasId()){
			std::string invalidRequest("Invalid Request");
			jsonRPC->SendRPCError(jsonRPC->ConstructRPCError(request.getId(), -32600, invalidRequest));
		}
		return false;
	}
}

} /*namespace pprpc*/
