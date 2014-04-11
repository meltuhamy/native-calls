#include <vector>
#include <string>
#include "ppapi/cpp/instance.h"
#include "ppapi/cpp/module.h"
#include "ppapi/cpp/var.h"
#include "ppapi/cpp/var_dictionary.h"
#include "ppapi/cpp/var_array.h"
#include "NaClRPCInstance.h"

void NaClRPCInstance::l(pp::Var x){
	LogToConsole(PP_LOGLEVEL_WARNING, x);
}
pp::VarDictionary * NaClRPCInstance::ConstructRequestDictionary(std::string method,
		pp::Var* params, int length) {
	pp::VarDictionary *rpcDict = ConstructBasicRequestDictionary(method);
	pp::VarArray paramsArray = pp::VarArray(rpcDict->Get("params"));
	for (int i = 0; i < length; i++) {
		paramsArray.Set(i, params[i]);
	}
	return rpcDict;
}

pp::VarDictionary * NaClRPCInstance::ConstructRequestDictionary(std::string method,
		std::vector<pp::Var> params) {
	pp::VarDictionary *rpcDict = ConstructBasicRequestDictionary(method);
	pp::VarArray paramsArray = pp::VarArray(rpcDict->Get("params"));
	for (std::vector<pp::Var>::size_type i = 0; i != params.size(); i++) {
		paramsArray.Set(i, params[i]);
	}
	return rpcDict;
}

pp::VarDictionary * NaClRPCInstance::ConstructResponseDictionary(int responseID,
		pp::Var responseResult) {
	pp::VarDictionary *rpcDict = ConstructBasicResponseDictionary(responseID);
	pp::VarArray responseArray = pp::VarArray(rpcDict->Get("result"));
	rpcDict->Set("result", responseResult);
	return rpcDict;

}


pp::VarDictionary * NaClRPCInstance::ConstructBasicRequestDictionary(
		std::string method) {
	pp::VarDictionary *rpcDict = ConstructBasicDictionary();
	rpcDict->Set("method", method);

	pp::VarArray paramsArray;
	rpcDict->Set("params", paramsArray);
	rpcDict->Set("id", id++);

	return rpcDict;
}

pp::VarDictionary * NaClRPCInstance::ConstructBasicResponseDictionary(int responseID) {
	pp::VarDictionary *rpcDict = ConstructBasicDictionary();

	rpcDict->Set("id", responseID);

	pp::VarArray resultArray;
	rpcDict->Set("result", resultArray);

	return rpcDict;
}

pp::VarDictionary * NaClRPCInstance::ConstructBasicDictionary() {
	// Construct a NaCl dictionary
	pp::VarDictionary *rpcDict = new pp::VarDictionary();
	rpcDict->Set("jsonrpc", "2.0");
	return rpcDict;
}

bool NaClRPCInstance::VerifyRPC(pp::Var d, std::string& methodName,
		pp::VarArray& params, int& id) {
	bool success = false;
	if (d.is_dictionary()) {
		pp::VarDictionary rpcDict = pp::VarDictionary(d);
		if (rpcDict.HasKey("jsonrpc") && rpcDict.HasKey("method")
				&& rpcDict.HasKey("params") && rpcDict.HasKey("id")
				&& rpcDict.Get("jsonrpc").AsString() == "2.0") {

			pp::Var methodVar = rpcDict.Get("method");
			pp::Var paramsVar = rpcDict.Get("params");
			pp::Var idVar = rpcDict.Get("id");
			if (methodVar.is_string() && paramsVar.is_array()
					&& idVar.is_int()) {
				methodName = methodVar.AsString();
				params = pp::VarArray(paramsVar);
				id = idVar.AsInt();
				success = true;
			}
		}
	}

	return success;
}

void NaClRPCInstance::HandleMessage(const pp::Var& var_message) {
	l("instance received message");
    std::string methodName; pp::VarArray methodParams; int id;
    if(VerifyRPC(var_message, methodName, methodParams, id)){
    	HandleRPC(methodName, methodParams, id);
    } else {
      // It's not a RPC call!
    	l("Instance received message that isn't jsonrpc.");
    	l("is_string, is_int, is_array, is_dictionary, is_array_buffer:");
    	l(var_message.is_string());
    	l(var_message.is_int());
    	l(var_message.is_array());
    	l(var_message.is_dictionary());
    	l(var_message.is_array_buffer());
    	l("debug string");
    	l(var_message.DebugString());
    }
}
