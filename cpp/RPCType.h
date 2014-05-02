/*
 * RPCType.h
 *
 *  Created on: 30 Apr 2014
 *      Author: meltuhamy
 */

#ifndef RPCTYPE_H_
#define RPCTYPE_H_

#include <string>
#include "ppapi/cpp/var.h"

namespace pprpc{

template <class T>
class ValidType{
public:
	ValidType(){
		setValid(false); // false by default, if no value given.
	}

	ValidType(T value){
		setValue(value);
		setValid(true); //true by default, if a value is given
	}

	bool isValid() const {
		return valid;
	}

	void setValid(bool valid) {
		this->valid = valid;
	}

	T getValue() const {
		return value;
	}

	void setValue(T value) {
		this->value = value;
	}

private:
	T value;
	bool valid;
};

} /*namespace pprpc*/


// this is an incredibly hacky solution

#define DEFINE_TYPE_CLASS_WITH_TYPESTRING(CLSNAME,CPPTYPE,TYPESTRING)\
class CLSNAME {\
public:\
	CLSNAME(){}\
	CLSNAME(pp::Var v){ setValue(v); }\
	CLSNAME(CPPTYPE v){ setValue(pprpc::ValidType<CPPTYPE>(v)); }\
	CLSNAME(pprpc::ValidType<CPPTYPE> v){ setValue(v); }\
	virtual ~CLSNAME(){}\
	pp::Var AsVar(){ return valueVar.is_undefined() ? AsVar(valueValidType) : valueVar; }\
	pprpc::ValidType<CPPTYPE> Extract(){ return valueValidType.isValid() ? valueValidType : Extract(valueVar); }\
	bool setValue(pp::Var v){\
		this->valueValidType = Extract(v);\
		if(!valueValidType.isValid()){\
			this->valueVar = pp::Var();\
			return false;\
		} else {\
			this->valueVar = v;\
			return true;\
		}\
	}\
	bool setValue(pprpc::ValidType<CPPTYPE> v){\
		this->valueVar = AsVar(v);\
		if(valueVar.is_undefined()){\
			this->valueValidType = pprpc::ValidType<CPPTYPE>();\
			return false;\
		} else {\
			this->valueValidType = v;\
			return true;\
		}\
	}\
	bool isValid(){ return valueValidType.isValid() && !valueVar.is_undefined();}\
	pp::Var AsVar(pprpc::ValidType<CPPTYPE> v);\
	pprpc::ValidType<CPPTYPE> Extract(pp::Var v);\
private:\
	static const std::string typeString;\
	pprpc::ValidType<CPPTYPE> valueValidType;\
	pp::Var valueVar;\
};\
const std::string CLSNAME::typeString = TYPESTRING;\


#define DEFINE_TYPE_CLASS(CLSNAME,CPPNAME) DEFINE_TYPE_CLASS_WITH_TYPESTRING(CLSNAME,CPPNAME,"CPPNAME")

#endif /* RPCTYPE_H_ */
