#ifndef NACL_RPC_H
#define NACL_RPC_H

namespace pp{
	class VarDictionary;
	class Var;
}
class NaClRPC
{
public:
	~NaClRPC(){
		isInstance = false;
	}
	static NaClRPC* getInstance();
	pp::VarDictionary * ConstructResponseDictionary(int responseID, pp::Var* responseParams, int length);
	pp::VarDictionary * ConstructResponseDictionary(int responseID, std::vector<pp::Var> responseParams);
	pp::VarDictionary * ConstructRequestDictionary(std::string method, pp::Var* params, int length);
	pp::VarDictionary * ConstructRequestDictionary(std::string method, std::vector<pp::Var> params);
	
private:
	// singleton class.
	static bool isInstance;
	static NaClRPC *instance;	
	NaClRPC(){
		id = 0;
	}
	
	// private methods and fields.
	int id;
	pp::VarDictionary * ConstructBasicResponseDictionary(int methodID);
	pp::VarDictionary * ConstructBasicRequestDictionary(std::string method);
	pp::VarDictionary * ConstructBasicDictionary();
};
#endif