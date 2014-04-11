#ifndef NACLRPC_H
#define NACLRPC_H
#include <ppapi/cpp/instance.h>
#include <vector>
namespace pp {
class VarDictionary;
class VarArray;
class Var;
}
class NaClRPCInstance : public pp::Instance {
public:
	NaClRPCInstance(PP_Instance instance) : Instance(instance) {
		id = 0;
	}
	virtual ~NaClRPCInstance() {
	}
	virtual void l(pp::Var x);
	pp::VarDictionary * ConstructResponseDictionary(int responseID,
			pp::Var responseResult);
	pp::VarDictionary * ConstructResponseDictionary(int responseID,
			std::vector<pp::Var> responseParams);
	pp::VarDictionary * ConstructRequestDictionary(std::string method,
			pp::Var* params, int length);
	pp::VarDictionary * ConstructRequestDictionary(std::string method,
			std::vector<pp::Var> params);
	virtual bool VerifyRPC(pp::Var d, std::string& methodName,
			pp::VarArray& params, int& id);

	virtual void HandleMessage(const pp::Var& var_message);

	// abstract method that the concrete instance needs to implement
	virtual void HandleRPC(std::string name, pp::VarArray params, int id) = 0;

private:
	// private methods and fields.
	int id;
	pp::VarDictionary * ConstructBasicResponseDictionary(int methodID);
	pp::VarDictionary * ConstructBasicRequestDictionary(std::string method);
	pp::VarDictionary * ConstructBasicDictionary();
};
#endif
