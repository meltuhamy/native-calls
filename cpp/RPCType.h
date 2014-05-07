/*
 * RPCType.h
 *
 *  Created on: 30 Apr 2014
 *      Author: meltuhamy
 */

#ifndef RPCTYPE_H_
#define RPCTYPE_H_

#include <string>
#include <vector>
#include "ppapi/cpp/var.h"
#include "ppapi/cpp/var_dictionary.h"
#include <stdio.h>
namespace pprpc{
class ValidTypeBase {

};

template <class T>
class ValidType : ValidTypeBase{
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
class RPCType {
	virtual std::string getTypeString() = 0;
};

#define QUOTEVALUE(s) #s
#define DEFINE_TYPE_CLASS_WITH_TYPESTRING(CLSNAME,CPPTYPE,TYPESTRING)\
class CLSNAME : RPCType {\
public:\
	CLSNAME(){}\
	CLSNAME(pp::Var v){ setValue(v); }\
	CLSNAME(CPPTYPE v){ setValue(pprpc::ValidType<CPPTYPE>(v)); }\
	CLSNAME(pprpc::ValidType<CPPTYPE> v){ setValue(v); }\
	virtual ~CLSNAME(){ /*fprintf(stdout, "\n%s::~%s()\n", QUOTEVALUE(CLSNAME), QUOTEVALUE(CLSNAME) );*/ }\
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
	virtual std::string getTypeString(){ return QUOTEVALUE(TYPESTRING); }\
	pp::Var AsVar(pprpc::ValidType<CPPTYPE> v);\
	static ValidType<std::vector<CPPTYPE> > ExtractVector(pp::Var v){\
		if(v.is_array()){\
			pp::VarArray vArray(v);\
			unsigned int length = vArray.GetLength();\
			std::vector<CPPTYPE> vector_CPPTYPE;\
			for(unsigned int i = 0; i < length; i++){\
				CLSNAME valid_CLSNAME(vArray.Get(i));\
				if(!valid_CLSNAME.isValid()){\
					return ValidType<std::vector<CPPTYPE> >();\
				} else {\
					vector_CPPTYPE.push_back(valid_CLSNAME.Extract().getValue());\
				}\
			}\
			return ValidType<std::vector<CPPTYPE> >(vector_CPPTYPE);\
		} else {\
			return ValidType<std::vector<CPPTYPE> >();\
		}\
	}\
	pprpc::ValidType<CPPTYPE> Extract(pp::Var v);\
private:\
	pprpc::ValidType<CPPTYPE> valueValidType;\
	pp::Var valueVar;\
};\


#define DEFINE_TYPE_CLASS(CLSNAME,CPPNAME) DEFINE_TYPE_CLASS_WITH_TYPESTRING(CLSNAME,CPPNAME,CPPNAME)





// DEFINE SOME IDL TYPES
namespace pprpc{
DEFINE_TYPE_CLASS(ByteType,char)
DEFINE_TYPE_CLASS(OctetType,unsigned char)
DEFINE_TYPE_CLASS(ShortType,short)
DEFINE_TYPE_CLASS(UShortType,unsigned short)
DEFINE_TYPE_CLASS(LongType,long)
DEFINE_TYPE_CLASS(ULongType,unsigned long)
DEFINE_TYPE_CLASS(LongLongType,long long)
DEFINE_TYPE_CLASS(ULongLongType,unsigned long long)

DEFINE_TYPE_CLASS(FloatType,float)
DEFINE_TYPE_CLASS(DoubleType,double)
DEFINE_TYPE_CLASS(DOMStringType,std::string)
DEFINE_TYPE_CLASS(BooleanType,bool)

// complex-ish types
DEFINE_TYPE_CLASS(NullType,pp::Var::Null)
DEFINE_TYPE_CLASS(ObjectType,pp::VarDictionary)

typedef NullType VoidType;
}



#endif /* RPCTYPE_H_ */
