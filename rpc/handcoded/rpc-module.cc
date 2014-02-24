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
    std::string methodName; pp::VarArray methodParams; int id;
    if(VerifyRPC(var_message, methodName, methodParams, id)){
      if(methodName == "echo"){
        // Expect 1 string paramater
        if(methodParams.GetLength() > 0 && methodParams.Get(0).is_string()){
          // function has a callback, get id.

          Echo(methodParams.Get(0), id);
        } else {
          ConsoleLog(pp::Var("Echo failed because incorrect arguments."));
        }
      } else if(methodName == "consoleLogTester") {
        ConsoleLogTester();
      }
    } else {
      // It's a normal message!
    }
  }

  virtual bool VerifyRPC(pp::Var d, std::string& methodName, pp::VarArray& params, int& id){
    bool success = false;
    if (d.is_dictionary()){
      pp::VarDictionary rpcDict = pp::VarDictionary(d);
      if(rpcDict.HasKey("json-rpc") && 
         rpcDict.HasKey("method") && 
         rpcDict.HasKey("params") && 
         rpcDict.HasKey("id") && 
         rpcDict.Get("json-rpc").AsString() == "2.0"){
        pp::Var methodVar = rpcDict.Get("method");
        pp::Var paramsVar = rpcDict.Get("params");
        pp::Var idVar     = rpcDict.Get("id");
        if(methodVar.is_string() && paramsVar.is_array() && idVar.is_int()){
          methodName = methodVar.AsString();
          params = pp::VarArray(paramsVar);
          id = idVar.AsInt();
          success = true;
        }
      }
    }

    return success;
  }

  virtual void ConsoleLog(pp::Var data){
    PostMessage(*NaClRPC::getInstance()->ConstructRequestDictionary("log", &data, 1));
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

  virtual void Echo(pp::Var data, int id){
    // call callback
    PostMessage(*NaClRPC::getInstance()->ConstructResponseDictionary(id, &data, 1));

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
