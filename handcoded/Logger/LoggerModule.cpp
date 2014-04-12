// Instance
#include "Logger.h" // this is what needs to be implemented by user.
#include <ppapi/cpp/instance.h>
#include "NaClRPCInstance.h"
#include "ppapi/cpp/var.h"
#include "ppapi/cpp/var_array.h"
#include "ppapi/cpp/var_dictionary.h"

class LoggerInstance: public NaClRPCInstance {
public:
	LoggerInstance(PP_Instance instance) : NaClRPCInstance(instance) {}
	virtual ~LoggerInstance(){}

	// Handle RPC method calls
	virtual void HandleRPC(std::string name, pp::VarArray params, int id){
		if(name == "helloName"){
			// expecting 1 param with type string
			if(params.GetLength() == 1){
				pp::Var firstParam = params.Get(0);
				if(firstParam.is_string()){
					// this is the actual method call, implemented in Logger.cpp
					std::string result = helloName(firstParam.AsString());
					// Now do a callback
					pp::Var responseData = pp::Var(result);
					PostMessage(*ConstructResponseDictionary(id, responseData));
				}
			}
		} else if(name == "greetName"){
			// expecting 2 params with type string
			if(params.GetLength() == 2){
				pp::Var firstParam = params.Get(0);
				pp::Var secondParam = params.Get(1);
				if(firstParam.is_string() && secondParam.is_string()){
					std::string result = greetName(firstParam.AsString(), secondParam.AsString());
					// Now do a callback
					pp::Var responseData = pp::Var(result);
					PostMessage(*ConstructResponseDictionary(id, responseData));
				}
			}
		}
	}

};



// Module
#include <ppapi/cpp/module.h>

class LoggerModule: public pp::Module {
public:
	LoggerModule() : pp::Module() {}
	virtual ~LoggerModule() {}
	virtual pp::Instance* CreateInstance(PP_Instance instance) {
		return new LoggerInstance(instance);
	}
};

namespace pp {
	Module* CreateModule() {
	  return new LoggerModule();
	}
}