// Instance
#include "ObjectsExample.h" // this is what needs to be implemented by user.
#include <ppapi/cpp/instance.h>
#include "NaClRPCInstance.h"
#include "ppapi/cpp/var.h"
#include "ppapi/cpp/var_array.h"
#include "ppapi/cpp/var_dictionary.h"
#include "ppapi/cpp/var_array_buffer.h"

class ObjectsExampleInstance: public NaClRPCInstance {
public:
	ObjectsExampleInstance(PP_Instance instance) : NaClRPCInstance(instance) {}
	virtual ~ObjectsExampleInstance(){}

	virtual void l(pp::Var content){
		LogToConsole(PP_LOGLEVEL_WARNING, content);
	}

	// Handle RPC method calls
	virtual void HandleRPC(std::string name, pp::VarArray params, int id){
		if(name == "acceptsObject"){
			l("Attempting to call method acceptsObject");
			// expecting 1 param with type object (dictionary);
			if(params.GetLength() == 1){
				l(" -> Correct number of params");
				pp::Var firstParam = params.Get(0);
				if(firstParam.is_dictionary()){
					l(" -> Correct param type");
					int result = acceptsObject(pp::VarDictionary(firstParam));
					// Now do a callback
					pp::Var responseData = pp::Var(result);
					PostMessage(*ConstructResponseDictionary(id, responseData));
				}
			}
		} else if(name == "acceptsTypedArray"){
			// expecting 1 param with type object, but actually an arraybuffer
			l("Attempting to call method acceptsTypedArray");
			if(params.GetLength() == 1){
				l(" -> Correct number of params");
				pp::Var firstParam = params.Get(0);
				if(firstParam.is_array_buffer()){
					l(" -> Correct param type");
					int result = acceptsTypedArray(pp::VarArrayBuffer(firstParam));
					// Now do a callback
					pp::Var responseData = pp::Var(result);
					PostMessage(*ConstructResponseDictionary(id, responseData));
				} else {
					l(" -> Incorrect param type");
					pp::VarDictionary dict = pp::VarDictionary(firstParam);
					l("Printing keys / values");
					pp::VarArray keysArray = dict.GetKeys();
					for(unsigned int i = 0; i < keysArray.GetLength(); i++){
						l("key");
						l(keysArray.Get(i));
						l("value");
						l(dict.Get(keysArray.Get(i).AsString()).DebugString());
					}
				}
			}
		}
	}

};



// Module
#include <ppapi/cpp/module.h>

class ObjectsExampleModule: public pp::Module {
public:
	ObjectsExampleModule() : pp::Module() {}
	virtual ~ObjectsExampleModule() {}
	virtual pp::Instance* CreateInstance(PP_Instance instance) {
		return new ObjectsExampleInstance(instance);
	}
};

namespace pp {
	Module* CreateModule() {
	  return new ObjectsExampleModule();
	}
}
