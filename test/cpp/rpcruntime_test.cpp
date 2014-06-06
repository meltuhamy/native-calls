#include "gtest/gtest.h"
#include "JSONRPC_mock.h"
#include "ppapi/cpp/instance.h"
#include "nativecalls/RPCRuntime.h"
#include "ppapi/cpp/var.h"
#include "ppapi/cpp/var_array.h"
#include <string>
#include <stdio.h>
#include "nativecalls/RPCType.h"
#include "gmock/gmock.h"

using ::testing::AtLeast;
using ::testing::_;
using ::testing::DefaultValue;
using ::testing::Invoke;


using namespace pprpc;

bool foo(){
	return true;
}

long add(long first, long second){
	return first+second;
}

class Functor_foo : public RPCServerStub{
public:
	virtual pp::Var call(const pp::VarArray* params, RPCError& error) {
		return pp::Var(foo());
	}
};


class FakeFunctor : public RPCServerStub{
public:
	virtual pp::Var call(const pp::VarArray* params, RPCError& error){
		return pp::Var(true);
	}
};


class MockFunctor : public RPCServerStub{
public:
	MOCK_METHOD2(call, pp::Var(const pp::VarArray*, RPCError&));

	// Delegates the default actions of the methods to a FakeFoo object.
	// This must be called *before* the custom ON_CALL() statements.
	void DelegateToFake() {
		ON_CALL(*this, call(_,_)).WillByDefault(Invoke(&fake_, &FakeFunctor::call));
	}

private:
	FakeFunctor fake_;  // Keeps an instance of the fake in the mock.

};


class Functor_add : public RPCServerStub{
public:
	virtual pp::Var call(const pp::VarArray* params, RPCError& error){
		// extract the paramaters and check
		LongType p0(params->Get(0));
		LongType p1(params->Get(1));
		LongType r;
		if(p0.isValid() && p1.isValid()){
			r = LongType(add(p0.Extract().getValue() , p1.Extract().getValue()));
		} else {
			error.init(-32602, "Invalid Params", "");
		}
		return r.AsVar();
	}
};



MockJSONRPC mockJSONRPC;

// should allow adding functions by string
TEST(RPCRuntimeLayer, AddFunctionTest){
	RPCRuntime runtime(&mockJSONRPC);
	bool added = runtime.AddFunctor("foo", new Functor_foo());
	EXPECT_TRUE(added==true);

	// adding again should fail
	added = runtime.AddFunctor("foo", new Functor_foo());
	EXPECT_FALSE(added==true);
}

// should allow getting functions by string
TEST(RPCRuntimeLayer, GetFunction){
	RPCRuntime runtime(&mockJSONRPC);
	bool added = runtime.AddFunctor("foo", new Functor_foo());
	EXPECT_TRUE(added==true);
	RPCServerStub* functor = runtime.GetFunctor("foo");
	EXPECT_TRUE(functor->isValid() == true);


}

// should allow calling functions by string
TEST(RPCRuntimeLayer, CallFunction){
	RPCRuntime runtime(&mockJSONRPC);
	// foo returns true!
	bool added = runtime.AddFunctor("foo", new Functor_foo());
	EXPECT_TRUE(added==true);
	RPCError error;
	pp::Var returnValue = runtime.CallFunctor("foo", new pp::VarArray(), error);
	EXPECT_TRUE(returnValue.is_bool() == true); // foo returns a bool.
	EXPECT_TRUE(returnValue.AsBool() == true); // foo returns true.
}

// should call functions with type checking
TEST(RPCRuntimeLayer, CallFunctionCheckType){
	// do one with correct type
	RPCRuntime runtime(&mockJSONRPC);
	bool added = runtime.AddFunctor("add", new Functor_add());
	EXPECT_TRUE(added == true);
	pp::VarArray correctParams;
	correctParams.Set(0, pp::Var(1));
	correctParams.Set(1, pp::Var(2));

	RPCError error;
	pp::Var returnValue = runtime.CallFunctor("add", &correctParams, error);
	EXPECT_TRUE(returnValue.AsInt() == 3); // 1+2=3
	EXPECT_TRUE(error.code == 0);

	// do one with not correct types
	pp::VarArray incorrectParams;
	correctParams.Set(0, pp::Var("not a number!"));
	correctParams.Set(1, pp::Var(2));

	returnValue = runtime.CallFunctor("add", &correctParams, error);
	EXPECT_FALSE(error.code == 0);

}

// should handle rpc messages (requests, callbacks, errors)
TEST(RPCRuntimeLayer, HandleRequest){
	// handle request: give me a request and I'll call the function

	// myMock constructs actual objects!
	MockJSONRPC myMock;
	myMock.DelegateToRealValidators();

	RPCRuntime runtime(&myMock);

	MockFunctor mockFoo;
	mockFoo.DelegateToFake(); //makes call return true

	bool added = runtime.AddFunctor("mockFoo", &mockFoo);
	EXPECT_TRUE(added==true);


	// mockFoo should be called when we call HandleRequest
	EXPECT_CALL(mockFoo, call(_,_)).Times(1);


	// the callback should be sent
	EXPECT_CALL(myMock, SendRPCCallback(_)).Times(1);


	// we force the request to be valid
	RPCRequest request("mockFoo", 23);
	request.setValid(true);
	bool handledOK = runtime.HandleRequest(request);

	EXPECT_TRUE(handledOK == true);


}

// todo C++ - JS RPC
//TEST(RPCRuntimeLayer, HandleCallback){
////	runtime.HandleCallback(pp::Var());
//}

// todo C++ - JS RPC
//TEST(RPCRuntimeLayer, HandleError){
////	runtime.HandleError(pp::Var());
//}

// todo C++ - JS RPC
// should send C++ - JS requests
//TEST(RPCRuntimeLayer, MakeRequest){
//
//}

// todo C++ - JS RPC
// should match callbacks with requests
//TEST(RPCRuntimeLayer, RequestCallbackMatch){
//
//}

// todo C++ - JS RPC
// should match errors with requests
//TEST(RPCRuntimeLayer, RequestErrorMatch){
//
//}
