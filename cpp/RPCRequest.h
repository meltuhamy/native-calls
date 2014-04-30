/*
 * RPCRequest.h
 *
 *  Created on: 28 Apr 2014
 *      Author: meltuhamy
 */

#ifndef RPCREQUEST_H_
#define RPCREQUEST_H_
#include <string>

namespace pp {
class Var;
class VarArray;
class VarDictionary;
}

namespace pprpc{
class RPCRequest {
public:
	RPCRequest(const pp::VarDictionary&);

	RPCRequest(const std::string& method, const pp::VarArray& params, unsigned long id);
	RPCRequest(const std::string& method, const pp::VarArray& params);
	RPCRequest(const std::string& method, unsigned long id);
	RPCRequest(const std::string& method);

	virtual ~RPCRequest();

	pp::Var AsVar();
	pp::VarDictionary AsDictionary();


	const std::string* method;

	const pp::VarArray* params;
	bool hasParams;

	unsigned long id;
	bool hasID;

	const pp::VarDictionary* original;

	bool isValid;
	void setValid(bool v){
		isValid = v;
	}

private:
	void init(const std::string& method, const pp::VarArray& params, unsigned long id);
	void init(const std::string& method, const pp::VarArray& params);
	void init(const std::string& method, unsigned long id);
	void init(const std::string& method);

};
} /* namespace pprpc */

#endif /* RPCREQUEST_H_ */
