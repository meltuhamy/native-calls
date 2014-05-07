// user
#include "ComplexTypes.h"
#include "Calculator.h" // this is what needs to be implemented by user.


//ppapi
#include <ppapi/cpp/instance.h>
#include "ppapi/cpp/var.h"
#include "ppapi/cpp/var_array.h"

//pprpc
#include "RPCTransport.h"
#include "JSONRPC.h"
#include "RPCRuntime.h"
#include "RPCType.h"

using namespace pprpc;

//std
#include <stdio.h>


// we define types here, and marshalling/demarshalling methods of each type.
DEFINE_TYPE_CLASS(complex_doubleType, complex_double);
pp::Var complex_doubleType::AsVar(ValidType<complex_double> v){
	complex_double value = v.getValue();
	pp::VarDictionary r;
	r.Set("real", value.real);
	r.Set("imaginary", value.imaginary);
	return r;
}

ValidType<complex_double> complex_doubleType::Extract(pp::Var v){
	if(v.is_dictionary()){
		pp::VarDictionary vDict(v);
		if(vDict.HasKey("real") && vDict.HasKey("imaginary")){
			DoubleType realPart(vDict.Get("real"));
			DoubleType imaginaryPart(vDict.Get("imaginary"));
			if(realPart.isValid() && imaginaryPart.isValid()){
				complex_double r;
				r.real = realPart.Extract().getValue();
				r.imaginary = imaginaryPart.Extract().getValue();
				return ValidType<complex_double>(r);
			}
		}
	}

	return ValidType<complex_double>();
}


// we define functors.
// functors are how we plug in our own code to the library.
// parameter marshaling happens here too.

class Functor_add : public RPCFunctor{
public:
	virtual pp::Var call(const pp::VarArray* params){
		if(params->GetLength() == 2){
			complex_doubleType p0(params->Get(0));
			complex_doubleType p1(params->Get(1));
			if(p0.isValid() && p1.isValid()){
				return complex_doubleType(add(p0.Extract().getValue(), p1.Extract().getValue())).AsVar();
			}
		}
		return pp::Var();
	}
};

class Functor_subtract : public RPCFunctor{
public:
	virtual pp::Var call(const pp::VarArray* params){
		if(params->GetLength() == 2){
			complex_doubleType p0(params->Get(0));
			complex_doubleType p1(params->Get(1));
			if(p0.isValid() && p1.isValid()){
				return complex_doubleType(subtract(p0.Extract().getValue(), p1.Extract().getValue())).AsVar();
			}
		}
		return pp::Var();
	}
};

class Functor_multiply : public RPCFunctor{
public:
	virtual pp::Var call(const pp::VarArray* params){
		if(params->GetLength() == 2){
			complex_doubleType p0(params->Get(0));
			complex_doubleType p1(params->Get(1));
			if(p0.isValid() && p1.isValid()){
				return complex_doubleType(multiply(p0.Extract().getValue(), p1.Extract().getValue())).AsVar();
			}
		}
		return pp::Var();
	}
};

class Functor_sum_all : public RPCFunctor{
public:
	virtual pp::Var call(const pp::VarArray* params){
		if(params->GetLength() == 1){
			ValidType<std::vector<complex_double> > p0 = complex_doubleType::ExtractVector(params->Get(0));
			if(p0.isValid()){
				return complex_doubleType(sum_all(p0.getValue())).AsVar();
			}
		}
		return pp::Var();
	}

};

class Functor_multiply_all : public RPCFunctor{
public:
	virtual pp::Var call(const pp::VarArray* params){
		if(params->GetLength() == 1){
			ValidType<std::vector<complex_double> > p0 = complex_doubleType::ExtractVector(params->Get(0));
			if(p0.isValid()){
				return complex_doubleType(multiply_all(p0.getValue())).AsVar();
			}
		}
		return pp::Var();
	}
};



#include <ppapi/cpp/module.h>

class ComplexModule: public pp::Module {
public:
	ComplexModule() : pp::Module() {}
	virtual ~ComplexModule() {
		fprintf(stdout, "\n~ComplexModule\n");
	}
	virtual pp::Instance* CreateInstance(PP_Instance instance) {
		// set up
		pprpc::RPCTransport* rpcTransport = new RPCTransport(instance);
		pprpc::JSONRPC* jsonRPC = new pprpc::JSONRPC(rpcTransport);
		pprpc::RPCRuntime* rpcRuntime = new pprpc::RPCRuntime(jsonRPC);

		// add methods
		rpcRuntime->AddFunctor("Calculator::add", new Functor_add);
		rpcRuntime->AddFunctor("Calculator::subtract", new Functor_subtract);
		rpcRuntime->AddFunctor("Calculator::multiply", new Functor_multiply);
		rpcRuntime->AddFunctor("Calculator::sum_all", new Functor_sum_all);
		rpcRuntime->AddFunctor("Calculator::multiply_all", new Functor_multiply_all);
		return rpcTransport;
	}
};

namespace pp {
	Module* CreateModule() {
	  return new ComplexModule();
	}
}
