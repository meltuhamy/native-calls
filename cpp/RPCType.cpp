/*
 * RPCType.cpp
 *
 *  Created on: 30 Apr 2014
 *      Author: meltuhamy
 */

#include <string>
#include "ppapi/cpp/var.h"
#include "RPCType.h"

namespace pprpc{

//TODO - right now all the integer type marshaling is just wrapping the int32_t type!

// byte
pp::Var ByteType::AsVar(ValidType<char> v){
	return pp::Var((int) v.getValue());
}

ValidType<char> ByteType::Extract(pp::Var v){
	if(v.is_int()){
		return ValidType<char>((char)v.AsInt());
	} else {
		return ValidType<char>();
	}
}

// octet
pp::Var OctetType::AsVar(ValidType<unsigned char> v){
	return pp::Var((int) v.getValue());
}

ValidType<unsigned char> OctetType::Extract(pp::Var v){
	if(v.is_int()){
		return ValidType<unsigned char>((unsigned char)v.AsInt());
	} else {
		return ValidType<unsigned char>();
	}
}

// short
pp::Var ShortType::AsVar(ValidType<short> v){
	return pp::Var((int) v.getValue());
}

ValidType<short> ShortType::Extract(pp::Var v){
	if(v.is_int()){
		return ValidType<short>((short)v.AsInt());
	} else {
		return ValidType<short>();
	}
}

// ushort
pp::Var UShortType::AsVar(ValidType<unsigned short> v){
	return pp::Var((int) v.getValue());
}

ValidType<unsigned short> UShortType::Extract(pp::Var v){
	if(v.is_int()){
		return ValidType<unsigned short>((unsigned short)v.AsInt());
	} else {
		return ValidType<unsigned short>();
	}
}

// long
pp::Var LongType::AsVar(ValidType<long> v){
	return pp::Var((int) v.getValue());
}

ValidType<long> LongType::Extract(pp::Var v){
	if(v.is_int()){
		return ValidType<long>((long)v.AsInt());
	} else {
		return ValidType<long>();
	}
}

// ulong

pp::Var ULongType::AsVar(ValidType<unsigned long> v){
	return pp::Var((int) v.getValue());
}

ValidType<unsigned long> ULongType::Extract(pp::Var v){
	if(v.is_int()){
		return ValidType<unsigned long>((unsigned long)v.AsInt());
	} else {
		return ValidType<unsigned long>();
	}
}


// longlong
pp::Var LongLongType::AsVar(ValidType<long long> v){
	return pp::Var((int) v.getValue());
}

ValidType<long long> LongLongType::Extract(pp::Var v){
	if(v.is_int()){
		return ValidType<long long>((long long)v.AsInt());
	} else {
		return ValidType<long long>();
	}
}

// ulonglong
pp::Var ULongLongType::AsVar(ValidType<unsigned long long> v){
	return pp::Var((int) v.getValue());
}

ValidType<unsigned long long> ULongLongType::Extract(pp::Var v){
	if(v.is_int()){
		return ValidType<unsigned long long>((unsigned long long)v.AsInt());
	} else {
		return ValidType<unsigned long long>();
	}
}

// float
pp::Var FloatType::AsVar(ValidType<double> v){
	return pp::Var(v.getValue());
}

ValidType<double> FloatType::Extract(pp::Var v){
	if(v.is_double()){
		return ValidType<double>(v.AsDouble());
	} else {
		return ValidType<double>();
	}
}

// domstring
pp::Var DOMStringType::AsVar(ValidType<std::string> v){
	return pp::Var(v.getValue());
}

ValidType<std::string> DOMStringType::Extract(pp::Var v){
	if(v.is_string()){
		return ValidType<std::string>(v.AsString());
	} else {
		return ValidType<std::string>();
	}
}

// boolean
pp::Var BooleanType::AsVar(ValidType<bool> v){
	return pp::Var(v.getValue());
}

ValidType<bool> BooleanType::Extract(pp::Var v){
	if(v.is_bool()){
		return ValidType<bool>(v.AsBool());
	} else {
		return ValidType<bool>();
	}
}

// null
pp::Var NullType::AsVar(ValidType<pp::Var::Null> v){
	return pp::Var(pp::Var::Null());
}

ValidType<pp::Var::Null> NullType::Extract(pp::Var v){
	if(v.is_null()){
		return ValidType<pp::Var::Null>(pp::Var::Null());
	} else {
		return ValidType<pp::Var::Null>();
	}
}

// object
pp::Var ObjectType::AsVar(ValidType<pp::VarDictionary> v){
	return v.getValue();
}

ValidType<pp::VarDictionary> ObjectType::Extract(pp::Var v){
	if(v.is_dictionary()){
		return ValidType<pp::VarDictionary>(pp::VarDictionary(v));
	} else {
		return ValidType<pp::VarDictionary>();
	}
}


}
