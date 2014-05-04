// user
#include "Fib.h" // this is what needs to be implemented by user.


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


// we define types out here using the DEFINE_TYPE_CLASS macro, defined in RPCType.h.


// we define functors.
// functors are how we plug in our own code to the library.
// parameter marshaling happens here too.

class Functor_fib : public RPCFunctor{
public:
	virtual pp::Var call(const pp::VarArray* params){
		// extract the parameters and check
		LongType p0(params->Get(0));
		LongType r;
		if(p0.isValid()){
			r = LongType(Fib::fib(p0.Extract().getValue()));
		} else {
		}
		return r.AsVar();
	}
};

class Functor_countUp : public RPCFunctor{
public:
	virtual pp::Var call(const pp::VarArray* params){
		LongType r;
		r = LongType(Fib::countUp());
		return r.AsVar();
	}
};



#include <ppapi/cpp/module.h>

class FibModule: public pp::Module {
public:
	FibModule() : pp::Module() {}
	virtual ~FibModule() {
		fprintf(stdout, "\n~FibModule\n");
	}
	virtual pp::Instance* CreateInstance(PP_Instance instance) {
		// set up
		pprpc::RPCTransport* rpcTransport = new RPCTransport(instance);
		pprpc::JSONRPC* jsonRPC = new pprpc::JSONRPC(rpcTransport);
		pprpc::RPCRuntime* rpcRuntime = new pprpc::RPCRuntime(jsonRPC);

		// add methods
		rpcRuntime->AddFunctor("Fib::fib", new Functor_fib());
		rpcRuntime->AddFunctor("Fib::countUp", new Functor_countUp());
		return rpcTransport;
	}
};

namespace pp {
	Module* CreateModule() {
	  return new FibModule();
	}
}
