#include <vector>
#include <string>
#include "ppapi/cpp/instance.h"
#include "ppapi/cpp/module.h"
#include "ppapi/cpp/var.h"
#include "ppapi/cpp/var_dictionary.h"
#include "ppapi/cpp/var_array.h"
#include "nacl-rpc.h"


// Currently only works with int paramaters...
NaClRPC::NaClRPC(std::string method, std::vector<int> params){
	// Construct a NaCl dictionary
	rpcDict = new pp::VarDictionary();
	rpcDict->Set(pp::Var("jsonrpc"), pp::Var("2.0"));
	rpcDict->Set(pp::Var("method"), pp::Var(method));

	pp::VarArray paramsArray;
	rpcDict->Set(pp::Var("params"), paramsArray);

	for(std::vector<int>::size_type i = 0; i != params.size(); i++) {
		paramsArray.Set(i,pp::Var(params[i]));
	}
}
