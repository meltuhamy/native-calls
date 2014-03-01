#include <vector>
#include <string>
#include "ppapi/cpp/instance.h"
#include "ppapi/cpp/module.h"
#include "ppapi/cpp/var.h"
#include "ppapi/cpp/var_dictionary.h"
#include "ppapi/cpp/var_array.h"
#include "nacl-rpc.h"

NaClRPC* NaClRPC::instance;
bool NaClRPC::isInstance;

NaClRPC* NaClRPC::getInstance(){
	if(!isInstance){
		instance = new NaClRPC();
		isInstance = true;
	}
	return instance;
}



pp::VarDictionary * NaClRPC::ConstructRequestDictionary(std::string method, pp::Var* params, int length){
	pp::VarDictionary *rpcDict = ConstructBasicRequestDictionary(method);
	pp::VarArray paramsArray = pp::VarArray(rpcDict->Get("params"));
	for(int i=0; i < length; i++){
		paramsArray.Set(i,params[i]);
	}
	return rpcDict;
}


pp::VarDictionary * NaClRPC::ConstructRequestDictionary(std::string method, std::vector<pp::Var> params){
	pp::VarDictionary *rpcDict = ConstructBasicRequestDictionary(method);
	pp::VarArray paramsArray = pp::VarArray(rpcDict->Get("params"));
	for(std::vector<pp::Var>::size_type i = 0; i != params.size(); i++) {
		paramsArray.Set(i,params[i]);
	}
	return rpcDict;
}

pp::VarDictionary * NaClRPC::ConstructResponseDictionary(int responseID, pp::Var* responseParams, int length){
	pp::VarDictionary *rpcDict = ConstructBasicResponseDictionary(responseID);
	pp::VarArray responseArray = pp::VarArray(rpcDict->Get("result"));
	for(int i=0; i < length; i++){
		responseArray.Set(i,responseParams[i]);
	}
	return rpcDict;

}

pp::VarDictionary * NaClRPC::ConstructResponseDictionary(int responseID, std::vector<pp::Var> responseParams){
	pp::VarDictionary *rpcDict = ConstructBasicResponseDictionary(responseID);
	pp::VarArray responseArray = pp::VarArray(rpcDict->Get("result"));
	for(std::vector<pp::Var>::size_type i = 0; i != responseParams.size(); i++) {
		responseArray.Set(i,responseParams[i]);
	}
	return rpcDict;
}

pp::VarDictionary * NaClRPC::ConstructBasicRequestDictionary(std::string method){
	pp::VarDictionary *rpcDict = ConstructBasicDictionary();
	rpcDict->Set("method", method);

	pp::VarArray paramsArray;
	rpcDict->Set("params", paramsArray);
	rpcDict->Set("id", id++);

	return rpcDict;
}

pp::VarDictionary * NaClRPC::ConstructBasicResponseDictionary(int responseID){
	pp::VarDictionary *rpcDict = ConstructBasicDictionary();

	rpcDict->Set("id", responseID);

	pp::VarArray resultArray;
	rpcDict->Set("result", resultArray);

	return rpcDict;
}

pp::VarDictionary * NaClRPC::ConstructBasicDictionary(){
	// Construct a NaCl dictionary
	pp::VarDictionary *rpcDict = new pp::VarDictionary();
	rpcDict->Set("jsonrpc", "2.0");
	return rpcDict;
}
