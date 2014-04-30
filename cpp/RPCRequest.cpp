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

	init(std::string(dict.Get("method").AsString()),
			pp::VarArray(dict.Get("params")),
			(unsigned long) dict.Get("id").AsInt());

	original = &dict;

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

void RPCRequest::init(const std::string& method) {
	this->method = &method;
	hasID = false;
	hasParams = false;
	isValid = false;
}


pp::Var RPCRequest::AsVar() {
	return AsDictionary();
}


pp::VarDictionary RPCRequest::AsDictionary() {
	if(original){
		return *original;
	} else {
		pp::VarDictionary obj;
		obj.Set("method", *method);
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
