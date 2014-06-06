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
#include <stdio.h>
namespace pp{
class Var;
class VarArray;
}

namespace pprpc{


class RPCRequest;
class JSONRPC;
class RPCError;

class RPCServerStub{
public:
	RPCServerStub(){
		setValid(false);
	}

	virtual ~RPCServerStub(){
		// fprintf(stdout, "\nRPCFunctor::~RPCFunctor()\n");
	}

	virtual pp::Var call(const pp::VarArray* params, RPCError& error);

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
	RPCRuntime(JSONRPC* jsonRPC);
	virtual ~RPCRuntime();

	virtual bool AddFunctor(std::string name, RPCServerStub* functor);
	virtual RPCServerStub* GetFunctor(std::string name);
	virtual pp::Var CallFunctor(std::string name, const pp::VarArray* params, RPCError& error);

	virtual bool HandleRequest(const pp::Var& request);
	virtual bool HandleRequest(const RPCRequest& request);
private:
	JSONRPC *jsonRPC;
	std::map<std::string, RPCServerStub*> *functorMap;
};

} /*namespace pprpc*/

#endif /* RPCRUNTIME_H_ */
