#include "RPCRequest.h"
#include "ppapi/cpp/var.h"
#include "ppapi/cpp/var_array.h"
#include "ppapi/cpp/var_dictionary.h"

namespace pprpc{
RPCRequest::~RPCRequest() {
	// TODO Auto-generated destructor stub
}

RPCRequest::RPCRequest(const pp::VarDictionary& dict) {
	hasID = dict.HasKey("id");
	hasParams = dict.HasKey("params");
	bool hasMethod = dict.HasKey("method");

	if(hasMethod){
		pp::Var methodVar(dict.Get("method"));
		if(methodVar.is_string()){
			std::string methodString(methodVar.AsString());
			if(hasParams && hasID){
				pp::Var paramsVar(dict.Get("params"));
				pp::Var idVar = dict.Get("id");
				if(paramsVar.is_dictionary() && idVar.is_int()){
					init(methodString, pp::VarArray(paramsVar), (unsigned long) idVar.AsInt());
				}
			} else if(hasParams){
				pp::Var paramsVar(dict.Get("params"));
				init(methodString, pp::VarArray(paramsVar));
			} else if(hasID){
				pp::Var idVar = dict.Get("id");
				if(idVar.is_int()){
					init(methodString, idVar.AsInt());
				}
			} else {
				init(methodString);
			}
		} else {
			setValid(false);
		}
	} else {
		// invalid
		setValid(false);
	}
	original = &dict;
	fromOriginal = true;

}

RPCRequest::RPCRequest(const std::string& method, const pp::VarArray& params,
		unsigned long id) {
	init(method, params, id);
}

RPCRequest::RPCRequest(const std::string& method, const pp::VarArray& params) {
	init(method, params);
}

RPCRequest::RPCRequest(const std::string& method, unsigned long id) {
	init(method, id);
}

RPCRequest::RPCRequest(const std::string& method) {
	init(method);
}

void RPCRequest::init(const std::string& method, const pp::VarArray& params,
		unsigned long id) {
	init(method, params);
	hasID = true;
	this->id = id;
}

void RPCRequest::init(const std::string& method, const pp::VarArray& params) {
	init(method);
	hasParams = true;
	this->params = &params;
}

void RPCRequest::init(const std::string& method, unsigned long id) {
	init(method);
	hasID = true;
	this->id = id;
}

const pp::VarArray* RPCRequest::getParams() const {
	if(isHasParams()){
		return params;
	} else {
		return new pp::VarArray();
	}
}

void RPCRequest::init(const std::string& method) {
	this->method = method;

	setHasId(false);
	setHasParams(false);
	setValid(false);
	setFromOriginal(false);
}


pp::Var RPCRequest::AsVar() {
	return AsDictionary();
}


pp::VarDictionary RPCRequest::AsDictionary() {
	if(isFromOriginal()){
		return *original;
	} else {
		pp::VarDictionary obj;
		obj.Set("method", method);
		obj.Set("jsonrpc","2.0");

		if(hasParams){
			obj.Set("params", *params);
		}

		if(hasID){
			obj.Set("id",(int)id);
		}


		return obj;
	}
}
} /*namespace pprpc*/
