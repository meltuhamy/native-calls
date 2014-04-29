#include "RPCRuntime.h"
#include "JSONRPC.h"
#include "ppapi/cpp/var.h"
#include "ppapi/cpp/var_array.h"
#include <map>
#include <string>


pp::Var RPCFunctor::operator ()(pp::VarArray params) {
	return pp::Var(); //return undefined by default.
}






RPCRuntime::~RPCRuntime() {

}

RPCRuntime::RPCRuntime(JSONRPC& jsonRPC) {
	this->jsonRPC = &jsonRPC;
	this->functorMap = new std::map<std::string, RPCFunctor*>();
}

bool RPCRuntime::AddFunctor(std::string name, RPCFunctor functor) {
	if(functorMap->find(name) == functorMap->end()){
		functorMap->insert(std::pair<std::string,RPCFunctor*>(name, &functor));
		return true;
	}
	return false;
}

RPCFunctor RPCRuntime::GetFunctor(std::string name) {
	std::map<std::string, RPCFunctor*>::const_iterator pos = functorMap->find(name);
	if(pos == functorMap->end()){
		// not found
		RPCFunctor invalid;
		invalid.setValid(false);
		return invalid;
	} else {
		return *(pos->second);
	}
}

pp::Var RPCRuntime::CallFunctor(std::string name, pp::VarArray params) {
	pp::Var returnValue; //default undefined
	RPCFunctor functor = GetFunctor(name);
	if(functor.isValid()){
		returnValue = functor(params);
	}
	return returnValue;
}
