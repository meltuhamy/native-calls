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
pp::Var ByteType::AsVar(const ValidType<int8_t>& v){
	return pp::Var((int) v.getValue());
}

ValidType<int8_t> ByteType::Extract(const pp::Var& v){
	if(v.is_int()){
		return ValidType<int8_t>((int8_t)v.AsInt());
	} else {
		return ValidType<int8_t>();
	}
}

// octet
pp::Var OctetType::AsVar(const ValidType<uint8_t>& v){
	return pp::Var((int) v.getValue());
}

ValidType<uint8_t> OctetType::Extract(const pp::Var& v){
	if(v.is_int()){
		return ValidType<uint8_t>((uint8_t)v.AsInt());
	} else {
		return ValidType<uint8_t>();
	}
}

// short
pp::Var ShortType::AsVar(const ValidType<int16_t>& v){
	return pp::Var((int) v.getValue());
}

ValidType<int16_t> ShortType::Extract(const pp::Var& v){
	if(v.is_int()){
		return ValidType<int16_t>((int16_t)v.AsInt());
	} else {
		return ValidType<int16_t>();
	}
}

// ushort
pp::Var UnsignedShortType::AsVar(const ValidType<uint16_t>& v){
	return pp::Var((int) v.getValue());
}

ValidType<uint16_t> UnsignedShortType::Extract(const pp::Var& v){
	if(v.is_int()){
		return ValidType<uint16_t>((uint16_t)v.AsInt());
	} else {
		return ValidType<uint16_t>();
	}
}

// long
pp::Var LongType::AsVar(const ValidType<int32_t>& v){
	return pp::Var((int) v.getValue());
}

ValidType<int32_t> LongType::Extract(const pp::Var& v){
	if(v.is_int()){
		return ValidType<int32_t>((int32_t)v.AsInt());
	} else {
		return ValidType<int32_t>();
	}
}

// ulong

pp::Var UnsignedLongType::AsVar(const ValidType<uint32_t>& v){
	return pp::Var((int) v.getValue());
}

ValidType<uint32_t> UnsignedLongType::Extract(const pp::Var& v){
	if(v.is_int()){
		return ValidType<uint32_t>((uint32_t)v.AsInt());
	} else {
		return ValidType<uint32_t>();
	}
}


// longlong
pp::Var LongLongType::AsVar(const ValidType<int64_t>& v){
	return pp::Var((int) v.getValue());
}

ValidType<int64_t> LongLongType::Extract(const pp::Var& v){
	if(v.is_int()){
		return ValidType<int64_t>((int64_t)v.AsInt());
	} else {
		return ValidType<int64_t>();
	}
}

// ulonglong
pp::Var UnsignedLongLongType::AsVar(const ValidType<uint64_t>& v){
	return pp::Var((int) v.getValue());
}

ValidType<uint64_t> UnsignedLongLongType::Extract(const pp::Var& v){
	if(v.is_int()){
		return ValidType<uint64_t>((uint64_t)v.AsInt());
	} else {
		return ValidType<uint64_t>();
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

// error
pp::Var RPCErrorType::AsVar(const ValidType<RPCError>& v){
	RPCError value = v.getValue();
	pp::VarDictionary r;
	r.Set("code", LongType(value.code).AsVar());
	r.Set("message", DOMStringType(value.message).AsVar());
	r.Set("type", DOMStringType(value.type).AsVar());
	return r;
}

ValidType<RPCError> RPCErrorType::Extract(const pp::Var& v){
	ValidType<RPCError> invalid;
	if(v.is_dictionary()){
		pp::VarDictionary vDict(v);
		RPCError r;

		/* member: code */
		if(!vDict.HasKey("code")) return invalid;
		const ValidType< int32_t >& codePart = LongType::Extract(vDict.Get("code"));
		if(!codePart.isValid()) return invalid;
		r.code = codePart.getValue();

		/* member: message */
		if(!vDict.HasKey("message")) return invalid;
		const ValidType< std::string >& messagePart = DOMStringType::Extract(vDict.Get("message"));
		if(!messagePart.isValid()) return invalid;
		r.message = messagePart.getValue();

		/* optional member: type */
		if(vDict.HasKey("type")){
			const ValidType< std::string >& typePart = DOMStringType::Extract(vDict.Get("type"));
			r.type = typePart.isValid() ? typePart.getValue() : "";
		} else {
			r.type = "";
		}

		return ValidType<RPCError>(r);
	}
	return ValidType<RPCError>();
}

//pp::Var MyErrorType::AsVar(const ValidType<MyError>& v){
//	MyError value = v.getValue();
//	pp::VarDictionary r = pp::VarDictionary(RPCErrorType::AsVar(ValidType<RPCError>(value)));
//	r.Set("myNumber", FloatType::AsVar(value.myNumber));
//
//	return r;
//}
//
//ValidType<MyError> MyErrorType::Extract(const pp::Var& v){
//	MyError r;
//	r.init(RPCErrorType::Extract(v).getValue());
//	if(v.is_dictionary()){
//		pp::VarDictionary vDict(v);
//		r.myNumber = FloatType::Extract(vDict.Get("myNumber")).getValue();
//	}
//	return ValidType<MyError>(r);
//}
}
