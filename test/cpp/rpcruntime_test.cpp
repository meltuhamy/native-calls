#include "gtest/gtest.h"
#include "JSONRPC_mock.h"
#include "ppapi/cpp/instance.h"
#include "RPCRuntime.h"
#include "ppapi/cpp/var.h"
#include "ppapi/cpp/var_array.h"
#include <string>
#include <stdio.h>

using namespace pprpc;

bool foo(){
	fprintf(stdout,"CALLED FOO!\n");
	return true;
}

class Functor_foo : public RPCFunctor{
public:
	virtual pp::Var call(pp::VarArray params) {
		return pp::Var(foo());
	}
};



MockJSONRPC mockJSONRPC;

// should allow adding functions by string
TEST(RPCRuntimeLayer, AddFunctionTest){
	RPCRuntime runtime(mockJSONRPC);
	bool added = runtime.AddFunctor("foo", new Functor_foo());
	EXPECT_TRUE(added==true);

	// adding again should fail
	added = runtime.AddFunctor("foo", new Functor_foo());
	EXPECT_FALSE(added==true);
}

// should allow getting functions by string
TEST(RPCRuntimeLayer, GetFunction){
	RPCRuntime runtime(mockJSONRPC);
	bool added = runtime.AddFunctor("foo", new Functor_foo());
	EXPECT_TRUE(added==true);
	RPCFunctor* functor = runtime.GetFunctor("foo");
	EXPECT_TRUE(functor->isValid() == true);


}

// should allow calling functions by string
TEST(RPCRuntimeLayer, CallFunction){
	RPCRuntime runtime(mockJSONRPC);
	// foo returns true!
	bool added = runtime.AddFunctor("foo", new Functor_foo());
	EXPECT_TRUE(added==true);
	pp::Var returnValue = runtime.CallFunctor("foo", pp::VarArray());
	EXPECT_TRUE(returnValue.is_bool() == true); // foo returns a bool.
	EXPECT_TRUE(returnValue.AsBool() == true); // foo returns true.
}

// should handle rpc messages (requests, callbacks, errors)
TEST(RPCRuntimeLayer, HandleRequest){
//	runtime.HandleRequest(pp::Var());
}

TEST(RPCRuntimeLayer, HandleCallback){
//	runtime.HandleCallback(pp::Var());
}

TEST(RPCRuntimeLayer, HandleError){
//	runtime.HandleError(pp::Var());
}

// should send C++ - JS requests
TEST(RPCRuntimeLayer, MakeRequest){

}

// should match callbacks with requests
TEST(RPCRuntimeLayer, RequestCallbackMatch){

}

// should match errors with requests
TEST(RPCRuntimeLayer, RequestErrorMatch){

}
