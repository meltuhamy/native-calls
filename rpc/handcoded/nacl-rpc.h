#ifndef NACL_RPC_H
#define NACL_RPC_H

namespace pp{
	class VarDictionary;
	class Var;
}
class NaClRPC
{
public:
	NaClRPC(std::string method, std::vector<pp::Var> params);
	NaClRPC(std::string method, pp::Var* params, int length);
	// ~NaClRPC();
	pp::VarDictionary * rpcDict;
	
private:
	void InitialiseJSONRPC(std::string method);
};

#endif