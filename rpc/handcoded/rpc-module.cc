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
    if (var_message.is_dictionary()){
      // decode json-rpc.
      pp::VarDictionary jsonrpc(var_message);
      if(jsonrpc.HasKey("json-rpc")){
        pp::Var rpcVersion = jsonrpc.Get("json-rpc");
        if(rpcVersion.is_string() && rpcVersion.AsString() == "2.0"){
          pp::Var rpcMethodName = jsonrpc.Get("method");
          pp::Var rpcArgs = jsonrpc.Get("params");
          pp::VarArray paramsArray;
          if(rpcArgs.is_array()){
            paramsArray = pp::VarArray(rpcArgs);
          }
          if(rpcMethodName.is_string()){
            std::string methodName = rpcMethodName.AsString();
            //massive if check here lol.
            if(methodName == "echo"){
              // do the echo function. Expecting one argument: a string.
              Echo(paramsArray.Get(0).AsString());
            } else if(methodName == "consoleLogTester"){
              // do consoleLogTester function, no arguments.
              ConsoleLogTester();
            }
          }
        }
      }
    }
    
  }

  virtual void ConsoleLog(pp::Var data){
    NaClRPC rpc("log", &data, 1);
    pp::VarDictionary dict = *rpc.rpcDict;
    PostMessage(dict);
  }

  virtual void ConsoleLogTester(){

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

    // ... and objects!
    pp::VarDictionary myDict;
    myDict.Set("Name","Mohamed Eltuhamy");
    myDict.Set("Project","Native Calls");
    ConsoleLog(myDict);
  }

  virtual void Echo(std::string data){
    ConsoleLog(pp::Var(data));
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
