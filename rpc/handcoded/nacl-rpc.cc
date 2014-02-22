#include <vector>
#include <string>
#include "ppapi/cpp/instance.h"
#include "ppapi/cpp/module.h"
#include "ppapi/cpp/var.h"
#include "ppapi/cpp/var_dictionary.h"
#include "ppapi/cpp/var_array.h"
#include "nacl-rpc.h"

NaClRPC::NaClRPC(std::string method, std::vector<pp::Var> params){
	InitialiseJSONRPC(method);
	pp::VarArray paramsArray = pp::VarArray(rpcDict->Get("params"));
	for(std::vector<pp::Var>::size_type i = 0; i != params.size(); i++) {
		paramsArray.Set(i,params[i]);
	}
}

NaClRPC::NaClRPC(std::string method, pp::Var* params, int length){
	InitialiseJSONRPC(method);
	pp::VarArray paramsArray = pp::VarArray(rpcDict->Get("params"));
	for(int i=0; i < length; i++){
		paramsArray.Set(i,params[i]);
	}
}

void NaClRPC::InitialiseJSONRPC(std::string method){
	// Construct a NaCl dictionary
	rpcDict = new pp::VarDictionary();
	rpcDict->Set("jsonrpc", "2.0");
	rpcDict->Set("method", method);

	pp::VarArray paramsArray;
	rpcDict->Set("params", paramsArray);
}