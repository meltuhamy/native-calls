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
	pp::VarDictionary * ConstructDictionary(std::string method, pp::Var* params, int length);
	pp::VarDictionary * ConstructDictionary(std::string method, std::vector<pp::Var> params);
	
private:
	// singleton class.
	static bool isInstance;
	static NaClRPC *instance;	
	NaClRPC(){
		id = 0;
	}
	
	// private methods and fields.
	int id;
	pp::VarDictionary * ConstructBasicDictionary(std::string method);
};
#endif