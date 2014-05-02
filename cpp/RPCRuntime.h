/*
 * RPCRuntime.h
 *
 *  Created on: 18 Apr 2014
 *      Author: meltuhamy
 */

#ifndef RPCRUNTIME_H_
#define RPCRUNTIME_H_
#include <string>
#include <map>
namespace pp{
class Var;
class VarArray;
}

namespace pprpc{


class RPCRequest;
class JSONRPC;

class RPCFunctor{
public:
	RPCFunctor(){
		setValid(false);
	}

	virtual ~RPCFunctor(){}

	virtual pp::Var call(pp::VarArray params);

	void setValid(bool v){
		valid = v;
	}

	bool isValid(){
		return valid;
	}

private:
	bool valid;
};


class RPCRuntime {
public:
	RPCRuntime(JSONRPC& jsonRPC);
	virtual ~RPCRuntime();

	virtual bool AddFunctor(std::string name, RPCFunctor* functor);
	virtual RPCFunctor* GetFunctor(std::string name);
	virtual pp::Var CallFunctor(std::string name, pp::VarArray params);

	virtual bool HandleRequest(const pp::Var& request);
	virtual bool HandleRequest(const RPCRequest& request);
private:
	JSONRPC *jsonRPC;
	std::map<std::string, RPCFunctor*> *functorMap;
};

} /*namespace pprpc*/

#endif /* RPCRUNTIME_H_ */
