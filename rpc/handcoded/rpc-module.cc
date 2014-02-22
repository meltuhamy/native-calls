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
    std::vector<int> params;
    params.push_back(1234);
    params.push_back(5678);
    NaClRPC rpc("log", params);
    pp::VarDictionary myDict = *rpc.rpcDict;

    PostMessage(myDict);
    PostMessage(var_message); // echo message back for debugging.
  
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
