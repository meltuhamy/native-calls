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

pp::Var RPCFunctor::call(pp::VarArray params) {
	fprintf(stdout, "WARNING: CALLING DEFAULT FUNCTOR\n");
	return pp::Var(); //return undefined by default.
}






RPCRuntime::~RPCRuntime() {

}

RPCRuntime::RPCRuntime(JSONRPC& jsonRPC) {
	this->jsonRPC = &jsonRPC;
	this->functorMap = new std::map<std::string, RPCFunctor*>();
}

bool RPCRuntime::AddFunctor(std::string name, RPCFunctor* functor) {
	fprintf(stdout, "Adding function: ");
	if(functorMap->find(name) == functorMap->end()){
		functorMap->insert(std::pair<std::string,RPCFunctor*>(name, functor));
		fprintf(stdout, "OK.\n");
		return true;
	}
	fprintf(stdout, "Already exists.\n");
	return false;
}

RPCFunctor* RPCRuntime::GetFunctor(std::string name) {
	fprintf(stdout, "Getting function: ");
	std::map<std::string, RPCFunctor*>::const_iterator pos = functorMap->find(name);
	if(pos == functorMap->end()){
		// not found
		fprintf(stdout, "Not found.\n");
		RPCFunctor* invalid = new RPCFunctor();
		invalid->setValid(false);
		return invalid;
	} else {
		fprintf(stdout, "OK.\n");
		pos->second->setValid(true);
		return pos->second;
	}
}

pp::Var RPCRuntime::CallFunctor(std::string name, pp::VarArray params) {
	pp::Var returnValue; //default undefined
	RPCFunctor* functor = GetFunctor(name);
	fprintf(stdout, "Calling function: ");
	if(functor->isValid()){
		fprintf(stdout, "OK.\n");
		returnValue = functor->call(params);
	} else {
		fprintf(stdout, "Invalid function.\n");
	}
	return returnValue;
}

bool RPCRuntime::HandleRequest(const pp::Var& requestVar) {
	return HandleRequest(RPCRequest(pp::VarDictionary(requestVar)));
}

bool RPCRuntime::HandleRequest(const RPCRequest& request) {
	if(request.isValid){
		// if an id was given, do a callback
		pp::Var returned = CallFunctor(*request.method, *request.params);
		if(request.hasID){
			// todo if an id was given, do a callback
//			jsonRPC->SendRPCCallback(jsonRPC->ConstructRPCCallback(request.id, returned));
		}

		return true;

	} else {
		// invalid request!
		return false;
	}
}

} /*namespace pprpc*/
