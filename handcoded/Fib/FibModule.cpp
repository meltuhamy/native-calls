// Instance
#include "Fib.h" // this is what needs to be implemented by user.
#include <ppapi/cpp/instance.h>
#include "NaClRPCInstance.h"
#include "ppapi/cpp/var.h"
#include "ppapi/cpp/var_array.h"
#include "ppapi/cpp/var_dictionary.h"

class FibInstance: public NaClRPCInstance {
public:
	FibInstance(PP_Instance instance) : NaClRPCInstance(instance) {}
	virtual ~FibInstance(){}

	// Handle RPC method calls
	virtual void HandleRPC(std::string name, pp::VarArray params, int id){
		if(name == "Fib::fib"){
			// expecting 1 param with type int
			if(params.GetLength() == 1){
				pp::Var firstParam = params.Get(0);
				if(firstParam.is_int()){
					int result = Fib::fib(firstParam.AsInt());
					// Now do a callback
					pp::Var responseData = pp::Var(result);
					PostMessage(*ConstructResponseDictionary(id, responseData));
				}
			}
		} else if(name == "Fib::countUp"){
			int result = Fib::countUp();
			pp::Var responseData = pp::Var(result);
			PostMessage(*ConstructResponseDictionary(id, responseData));
		}
	}

};



// Module
#include <ppapi/cpp/module.h>

class FibModule: public pp::Module {
public:
	FibModule() : pp::Module() {}
	virtual ~FibModule() {}
	virtual pp::Instance* CreateInstance(PP_Instance instance) {
		return new FibInstance(instance);
	}
};

namespace pp {
	Module* CreateModule() {
	  return new FibModule();
	}
}
