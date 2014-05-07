#include "RPCRuntime.h"
#include "JSONRPC.h"
#include "ppapi/cpp/var.h"
#include "ppapi/cpp/var_array.h"
#include "ppapi/cpp/var_dictionary.h"
#include <map>
#include <string>
#include <stdio.h>
#include "RPCRequest.h"

namespace pprpc{

pp::Var RPCFunctor::call(const pp::VarArray* params) {
	return pp::Var(); //return undefined by default.
}






RPCRuntime::~RPCRuntime() {
	// fprintf(stdout, "\nRPCRuntime::~RPCRuntime()\n");
}

RPCRuntime::RPCRuntime(JSONRPC* jsonRPC) {
	this->jsonRPC = jsonRPC;
	this->jsonRPC->setRuntime(this);
	this->functorMap = new std::map<std::string, RPCFunctor*>();
}

bool RPCRuntime::AddFunctor(std::string name, RPCFunctor* functor) {
	if(functorMap->find(name) == functorMap->end()){
		functorMap->insert(std::pair<std::string,RPCFunctor*>(name, functor));
		return true;
	}
	return false;
}

RPCFunctor* RPCRuntime::GetFunctor(std::string name) {
	std::map<std::string, RPCFunctor*>::const_iterator pos = functorMap->find(name);
	if(pos == functorMap->end()){
		// not found
		RPCFunctor* invalid = new RPCFunctor();
		invalid->setValid(false);
		return invalid;
	} else {
		pos->second->setValid(true);
		return pos->second;
	}
}

pp::Var RPCRuntime::CallFunctor(std::string name, const pp::VarArray* params) {
	pp::Var returnValue; //default undefined
	RPCFunctor* functor = GetFunctor(name);
	if(functor->isValid()){
		returnValue = functor->call(params);
	} else {
	}
	return returnValue;
}

bool RPCRuntime::HandleRequest(const pp::Var& requestVar) {
	return HandleRequest(RPCRequest(pp::VarDictionary(requestVar)));
}

bool RPCRuntime::HandleRequest(const RPCRequest& request) {
	bool valid = request.isValid();
	if(valid){
		// if an id was given, do a callback
		pp::Var returned = CallFunctor(request.getMethod(), request.getParams());
		if(request.isHasId()){
			//if an id was given, do a callback
			return jsonRPC->SendRPCCallback(jsonRPC->ConstructRPCCallback(request.getId(), returned));
		} else {
		}

		return true;

	} else {
		// invalid request!
		return false;
	}
}

} /*namespace pprpc*/
