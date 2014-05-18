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
	RPCRequest();
	RPCRequest(const pp::VarDictionary&);
	RPCRequest(const std::string& method, const pp::VarArray& params, unsigned long id);
	RPCRequest(const std::string& method, const pp::VarArray& params);
	RPCRequest(const std::string& method, unsigned long id);
	RPCRequest(const std::string& method);

	virtual ~RPCRequest();

	pp::Var AsVar();
	pp::VarDictionary AsDictionary();

	bool isFromOriginal() const {
		return fromOriginal;
	}

	void setFromOriginal(bool fromOriginal) {
		this->fromOriginal = fromOriginal;
	}

	bool isHasId() const {
		return hasID;
	}

	void setHasId(bool hasId) {
		hasID = hasId;
	}

	bool isHasParams() const {
		return hasParams;
	}

	void setHasParams(bool hasParams) {
		this->hasParams = hasParams;
	}

	unsigned long getId() const {
		return id;
	}

	void setId(unsigned long id) {
		this->id = id;
	}

	const std::string& getMethod() const {
		return method;
	}

	void setMethod(const std::string& method) {
		this->method = method;
	}

	const pp::VarDictionary* getOriginal() const {
		return original;
	}

	void setOriginal(const pp::VarDictionary*& original) {
		this->original = original;
	}

	const pp::VarArray* getParams() const;

	void setParams(const pp::VarArray*& params) {
		this->params = params;
	}

	bool isValid() const {
		return valid;
	}

	void setValid(bool valid) {
		this->valid = valid;
	}

private:
	void init(const std::string& method, const pp::VarArray& params, unsigned long id);
	void init(const std::string& method, const pp::VarArray& params);
	void init(const std::string& method, unsigned long id);
	void init(const std::string& method);


	std::string method;

	const pp::VarArray* params;
	bool hasParams;

	unsigned long id;
	bool hasID;

	const pp::VarDictionary* original;
	bool fromOriginal;

	bool valid;
};
} /* namespace pprpc */

#endif /* RPCREQUEST_H_ */
