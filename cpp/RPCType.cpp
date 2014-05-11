/*
 * RPCType.cpp
 *
 *  Created on: 30 Apr 2014
 *      Author: meltuhamy
 */

#include <string>
#include "ppapi/cpp/var.h"
#include "RPCType.h"
#include <vector>

namespace pprpc{

//TODO - right now all the integer type marshaling is just wrapping the int32_t type!

// byte
pp::Var ByteType::AsVar(const ValidType<char>& v){
	return pp::Var((int) v.getValue());
}

ValidType<char> ByteType::Extract(const pp::Var& v){
	if(v.is_int()){
		return ValidType<char>((char)v.AsInt());
	} else {
		return ValidType<char>();
	}
}

// octet
pp::Var OctetType::AsVar(const ValidType<unsigned char>& v){
	return pp::Var((int) v.getValue());
}

ValidType<unsigned char> OctetType::Extract(const pp::Var& v){
	if(v.is_int()){
		return ValidType<unsigned char>((unsigned char)v.AsInt());
	} else {
		return ValidType<unsigned char>();
	}
}

// short
pp::Var ShortType::AsVar(const ValidType<short>& v){
	return pp::Var((int) v.getValue());
}

ValidType<short> ShortType::Extract(const pp::Var& v){
	if(v.is_int()){
		return ValidType<short>((short)v.AsInt());
	} else {
		return ValidType<short>();
	}
}

// ushort
pp::Var UnsignedShortType::AsVar(const ValidType<unsigned short>& v){
	return pp::Var((int) v.getValue());
}

ValidType<unsigned short> UnsignedShortType::Extract(const pp::Var& v){
	if(v.is_int()){
		return ValidType<unsigned short>((unsigned short)v.AsInt());
	} else {
		return ValidType<unsigned short>();
	}
}

// long
pp::Var LongType::AsVar(const ValidType<long>& v){
	return pp::Var((int) v.getValue());
}

ValidType<long> LongType::Extract(const pp::Var& v){
	if(v.is_int()){
		return ValidType<long>((long)v.AsInt());
	} else {
		return ValidType<long>();
	}
}

// ulong

pp::Var UnsignedLongType::AsVar(const ValidType<unsigned long>& v){
	return pp::Var((int) v.getValue());
}

ValidType<unsigned long> UnsignedLongType::Extract(const pp::Var& v){
	if(v.is_int()){
		return ValidType<unsigned long>((unsigned long)v.AsInt());
	} else {
		return ValidType<unsigned long>();
	}
}


// longlong
pp::Var LongLongType::AsVar(const ValidType<long long>& v){
	return pp::Var((int) v.getValue());
}

ValidType<long long> LongLongType::Extract(const pp::Var& v){
	if(v.is_int()){
		return ValidType<long long>((long long)v.AsInt());
	} else {
		return ValidType<long long>();
	}
}

// ulonglong
pp::Var UnsignedLongLongType::AsVar(const ValidType<unsigned long long>& v){
	return pp::Var((int) v.getValue());
}

ValidType<unsigned long long> UnsignedLongLongType::Extract(const pp::Var& v){
	if(v.is_int()){
		return ValidType<unsigned long long>((unsigned long long)v.AsInt());
	} else {
		return ValidType<unsigned long long>();
	}
}

// float
pp::Var FloatType::AsVar(const ValidType<float>& v){
	return pp::Var(v.getValue());
}

ValidType<float> FloatType::Extract(const pp::Var& v){
	if(v.is_number()){
		return ValidType<float>((float)v.AsDouble());
	} else {
		return ValidType<float>();
	}
}


// double
pp::Var DoubleType::AsVar(const ValidType<double>& v){
	return pp::Var(v.getValue());
}

ValidType<double> DoubleType::Extract(const pp::Var& v){
	if(v.is_number()){
		return ValidType<double>(v.AsDouble());
	} else {
		return ValidType<double>();
	}
}


// domstring
pp::Var DOMStringType::AsVar(const ValidType<std::string>& v){
	return pp::Var(v.getValue());
}

ValidType<std::string> DOMStringType::Extract(const pp::Var& v){
	if(v.is_string()){
		return ValidType<std::string>(v.AsString());
	} else {
		return ValidType<std::string>();
	}
}

// boolean
pp::Var BooleanType::AsVar(const ValidType<bool>& v){
	return pp::Var(v.getValue());
}

ValidType<bool> BooleanType::Extract(const pp::Var& v){
	if(v.is_bool()){
		return ValidType<bool>(v.AsBool());
	} else {
		return ValidType<bool>();
	}
}

// null
pp::Var NullType::AsVar(const ValidType<pp::Var::Null>& v){
	return pp::Var(pp::Var::Null());
}

ValidType<pp::Var::Null> NullType::Extract(const pp::Var& v){
	if(v.is_null()){
		return ValidType<pp::Var::Null>(pp::Var::Null());
	} else {
		return ValidType<pp::Var::Null>();
	}
}

// object
pp::Var ObjectType::AsVar(const ValidType<pp::VarDictionary>& v){
	return v.getValue();
}

ValidType<pp::VarDictionary> ObjectType::Extract(const pp::Var& v){
	if(v.is_dictionary()){
		return ValidType<pp::VarDictionary>(pp::VarDictionary(v));
	} else {
		return ValidType<pp::VarDictionary>();
	}
}


}
