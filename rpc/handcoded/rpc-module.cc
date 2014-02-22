#include "ppapi/cpp/instance.h"
#include "ppapi/cpp/module.h"
#include "ppapi/cpp/var.h"
#include "nacl-rpc.h"
#include "ppapi/cpp/var_dictionary.h"

class RPCInstance : public pp::Instance {
 public:
  explicit RPCInstance(PP_Instance instance)
      : pp::Instance(instance) {}
  virtual ~RPCInstance() {}

  virtual void HandleMessage(const pp::Var& var_message) {
    std::string message = var_message.AsString();
    
    // look, ma! console logging from C++!
    ConsoleLog(pp::Var("logging from C++!"));

    // works with ints
    ConsoleLog(pp::Var(123));

    // ... and arrays
    pp::VarArray myArray;
    myArray.Set(0,"item1");
    myArray.Set(1,"item2");
    myArray.Set(2,"item3");
    ConsoleLog(myArray);

    // ... and objects
    pp::VarDictionary myDict;
    myDict.Set("Name","Mohamed Eltuhamy");
    myDict.Set("Project","Native Calls");
    ConsoleLog(myDict);

    // PostMessage(var_message); // echo message back for debugging.
  
  }

  virtual void ConsoleLog(pp::Var data){
    NaClRPC rpc("log", &data, 1);
    pp::VarDictionary dict = *rpc.rpcDict;
    PostMessage(dict);
  }


};

class RPCModule : public pp::Module {
 public:
  RPCModule() : pp::Module() {}
  virtual ~RPCModule() {}

  virtual pp::Instance* CreateInstance(PP_Instance instance) {
    return new RPCInstance(instance);
  }
};

namespace pp {

Module* CreateModule() {
  return new RPCModule();
}

}  // namespace pp
