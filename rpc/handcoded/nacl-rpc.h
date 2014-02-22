#ifndef NACL_RPC_H
#define NACL_RPC_H

namespace pp{
	class VarDictionary;
}
class NaClRPC
{
public:
	NaClRPC(std::string method, std::vector<int> params);
	// ~NaClRPC();
	pp::VarDictionary * rpcDict;
	
};

#endif