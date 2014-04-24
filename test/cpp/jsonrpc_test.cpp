#include "JSONRPC_mock.h"
#include "RPCTransport_mock.h"
#include "gmock/gmock.h"
#include "gtest/gtest.h"
#include "JSONRPC.h"
#include "ppapi/cpp/var.h"
#include "ppapi/cpp/var_array.h"
#include "ppapi/cpp/var_dictionary.h"

#include <string>

using ::testing::AtLeast;
using ::testing::_;
using ::testing::DefaultValue;
using ::testing::Invoke;

// it should construct with/without a transport
TEST(JSONRPCLayer, EmptyConstructorTest){
	ASSERT_NO_THROW(new JSONRPC(););
}

TEST(JSONRPCLayer, TransportConstructorTest){
	MockRPCTransport transport;
	ASSERT_NO_THROW(new JSONRPC(&transport););
}

// it should update the transport when constructed with one
TEST(JSONRPCLayer, UpdateTransportTest){
	MockRPCTransport transport;
	EXPECT_CALL(transport, setJSONRPC(_)).Times(AtLeast(1));
	new JSONRPC(&transport);
}


// it should validate json-rpc requests according to spec
TEST(JSONRPCLayer, ValidateJSONRPCRequestTest){
	JSONRPC jsonRPC;

	// should return true.
	{
		pp::VarDictionary obj;
		obj.Set("jsonrpc","2.0");
		obj.Set("method","helloWorld");
		pp::VarArray obj_params;
		obj_params.Set(0, "hello!");
		obj.Set("params",obj_params);
		obj.Set("id",1);

		ASSERT_TRUE(jsonRPC.ValidateRPCRequest(obj) == true);
	}

	// string id
	{
		pp::VarDictionary obj;
		obj.Set("jsonrpc","2.0");
		obj.Set("method","helloWorld");
		pp::VarArray obj_params;
		obj_params.Set(0, "hello!");
		obj.Set("params",obj_params);
		obj.Set("id","mymethod1");

		ASSERT_TRUE(jsonRPC.ValidateRPCRequest(obj) == true);
	}

	//null id
	{
		pp::VarDictionary obj;
		obj.Set("jsonrpc","2.0");
		obj.Set("method","helloWorld");
		pp::VarArray obj_params;
		obj_params.Set(0, "hello!");
		obj.Set("params",obj_params);
		obj.Set("id", pp::Var::Null());

		ASSERT_TRUE(jsonRPC.ValidateRPCRequest(obj) == true);
	}

	// notification
	{
		pp::VarDictionary obj;
		obj.Set("jsonrpc","2.0");
		obj.Set("method","helloWorld");
		pp::VarArray obj_params;
		obj_params.Set(0, "hello!");
		obj.Set("params",obj_params);
		ASSERT_TRUE(jsonRPC.ValidateRPCRequest(obj) == true);
	}

	// without params
	{
		pp::VarDictionary obj;
		obj.Set("jsonrpc","2.0");
		obj.Set("method","helloWorld");
		obj.Set("id",1);

		ASSERT_TRUE(jsonRPC.ValidateRPCRequest(obj) == true);
	}

	// should return false;
	// without jsonrpc
	{
		pp::VarDictionary obj;
		obj.Set("method","helloWorld");
		pp::VarArray obj_params;
		obj_params.Set(0, "hello!");
		obj.Set("params",obj_params);
		obj.Set("id",1);

		ASSERT_FALSE(jsonRPC.ValidateRPCRequest(obj) == true);
	}

	// bogus jsonrpc
	{
		pp::VarDictionary obj;
		obj.Set("jsonrpc","hello");
		obj.Set("method","helloWorld");
		pp::VarArray obj_params;
		obj_params.Set(0, "hello!");
		obj.Set("params",obj_params);
		obj.Set("id",1);

		ASSERT_FALSE(jsonRPC.ValidateRPCRequest(obj) == true);

	}

	// non string method
	{
		pp::VarDictionary obj;
		obj.Set("jsonrpc","2.0");
		obj.Set("method",1163936);
		pp::VarArray obj_params;
		obj_params.Set(0, "hello!");
		obj.Set("params",obj_params);
		obj.Set("id",1);

		ASSERT_FALSE(jsonRPC.ValidateRPCRequest(obj) == true);
	}

	// non string/number/null id
	{
		pp::VarDictionary obj;
		obj.Set("jsonrpc","2.0");
		obj.Set("method","helloWorld");
		pp::VarArray obj_params;
		obj_params.Set(0, "hello!");
		obj.Set("params",obj_params);
		pp::VarDictionary obj_id;
		obj_id.Set("this","should fail.");
		obj.Set("id",obj_id);

		ASSERT_FALSE(jsonRPC.ValidateRPCRequest(obj) == true);
	}

	// fractional id
	{
		pp::VarDictionary obj;
		obj.Set("jsonrpc","2.0");
		obj.Set("method","helloWorld");
		pp::VarArray obj_params;
		obj_params.Set(0, "hello!");
		obj.Set("params",obj_params);
		obj.Set("id",2.3333);

		ASSERT_FALSE(jsonRPC.ValidateRPCRequest(obj) == true);
	}

	// not a request
	{
		pp::VarDictionary obj;
		obj.Set("jsonrpc","2.0");
		obj.Set("result",19);
		obj.Set("id",1);

		ASSERT_FALSE(jsonRPC.ValidateRPCRequest(obj) == true);
	}

}


// it should validate json-rpc callbacks and errors according to spec
TEST(JSONRPCLayer, ValidateJSONRPCCallbacksAndErrorsTest){
	JSONRPC jsonRPC;
	{
		pp::VarDictionary obj;
		obj.Set("jsonrpc","2.0");
		obj.Set("result",19);
		obj.Set("id",1);

		// it's a callback, not a request, not a error.
		ASSERT_TRUE(jsonRPC.ValidateRPCCallback(obj) == true);
		ASSERT_FALSE(jsonRPC.ValidateRPCRequest(obj) == true);
		ASSERT_FALSE(jsonRPC.ValidateRPCError(obj) == true);
	}

	// string id
	{
		pp::VarDictionary obj;
		obj.Set("jsonrpc","2.0");
		obj.Set("result",19);
		obj.Set("id","myID1");
		ASSERT_TRUE(jsonRPC.ValidateRPCCallback(obj) == true);
		ASSERT_FALSE(jsonRPC.ValidateRPCRequest(obj) == true);
		ASSERT_FALSE(jsonRPC.ValidateRPCError(obj) == true);
	}

	// it's an error, not a callback, and not a request.
	{
		pp::VarDictionary obj;
		obj.Set("jsonrpc","2.0");
		pp::VarDictionary obj_error;
		obj_error.Set("code",-32700);
		obj_error.Set("message","failed to parse");
		obj_error.Set("data","the server failed to parse the message: 123");
		obj.Set("error",obj_error);
		obj.Set("id",1);
		ASSERT_FALSE(jsonRPC.ValidateRPCCallback(obj) == true);
		ASSERT_FALSE(jsonRPC.ValidateRPCRequest(obj) == true);
		ASSERT_TRUE(jsonRPC.ValidateRPCError(obj) == true);
	}

	// it's an error, not a callback, and not a request.
	{
		pp::VarDictionary obj;
		obj.Set("jsonrpc","2.0");
		pp::VarDictionary obj_error;
		obj_error.Set("code",-32700);
		obj_error.Set("message","failed to parse");
		obj.Set("error",obj_error);
		obj.Set("id",1);
		ASSERT_FALSE(jsonRPC.ValidateRPCCallback(obj) == true);
		ASSERT_FALSE(jsonRPC.ValidateRPCRequest(obj) == true);
		ASSERT_TRUE(jsonRPC.ValidateRPCError(obj) == true);
	}

	// failing cases
	// need jsonrpc
	{
		pp::VarDictionary obj;
		obj.Set("result",19);
		obj.Set("id",1);
		ASSERT_FALSE(jsonRPC.ValidateRPCCallback(obj) == true);
		ASSERT_FALSE(jsonRPC.ValidateRPCRequest(obj) == true);
		ASSERT_FALSE(jsonRPC.ValidateRPCError(obj) == true);
	}

	//can't have both result and error
	{
		pp::VarDictionary obj;
		obj.Set("jsonrpc","2.0");
		obj.Set("result",19);
		pp::VarDictionary obj_error;
		obj.Set("error",obj_error);
		obj.Set("id",1);
		ASSERT_FALSE(jsonRPC.ValidateRPCCallback(obj) == true);
		ASSERT_FALSE(jsonRPC.ValidateRPCRequest(obj) == true);
		ASSERT_FALSE(jsonRPC.ValidateRPCError(obj) == true);
	}

	//can't have both result and error
	{
		pp::VarDictionary obj;
		obj.Set("jsonrpc","2.0");
		obj.Set("result",23);
		pp::VarDictionary obj_error;
		obj_error.Set("code",-32700);
		obj_error.Set("message","failed to parse");
		obj_error.Set("data","the server failed to parse the message: 123");
		obj.Set("error",obj_error);
		obj.Set("id",1);
		ASSERT_FALSE(jsonRPC.ValidateRPCCallback(obj) == true);
		ASSERT_FALSE(jsonRPC.ValidateRPCRequest(obj) == true);
		ASSERT_FALSE(jsonRPC.ValidateRPCError(obj) == true);
	}

	//can't have a callback without an id
	{
		pp::VarDictionary obj;
		obj.Set("jsonrpc","2.0");
		obj.Set("result",19);
		pp::VarDictionary obj_error;
		obj.Set("error",obj_error);
		ASSERT_FALSE(jsonRPC.ValidateRPCCallback(obj) == true);
		ASSERT_FALSE(jsonRPC.ValidateRPCRequest(obj) == true);
		ASSERT_FALSE(jsonRPC.ValidateRPCError(obj) == true);
	}

	// can't have an error without an id
	{
		pp::VarDictionary obj;
		obj.Set("jsonrpc","2.0");
		obj.Set("result",23);
		pp::VarDictionary obj_error;
		obj_error.Set("code",-32700);
		obj_error.Set("message","failed to parse");
		obj_error.Set("data","the server failed to parse the message: 123");
		obj.Set("error",obj_error);
		ASSERT_FALSE(jsonRPC.ValidateRPCCallback(obj) == true);
		ASSERT_FALSE(jsonRPC.ValidateRPCRequest(obj) == true);
		ASSERT_FALSE(jsonRPC.ValidateRPCError(obj) == true);
	}

	// can't have error without error object
	{
		pp::VarDictionary obj;
		obj.Set("jsonrpc","2.0");
		obj.Set("error",19);
		obj.Set("id",1);
		ASSERT_FALSE(jsonRPC.ValidateRPCCallback(obj) == true);
		ASSERT_FALSE(jsonRPC.ValidateRPCRequest(obj) == true);
		ASSERT_FALSE(jsonRPC.ValidateRPCError(obj) == true);
	}

	// can't have error without error code
	{
		pp::VarDictionary obj;
		obj.Set("jsonrpc","2.0");
		pp::VarDictionary obj_error;
		obj_error.Set("message","failed");
		obj.Set("error",obj_error);
		obj.Set("id",1);
		ASSERT_FALSE(jsonRPC.ValidateRPCCallback(obj) == true);
		ASSERT_FALSE(jsonRPC.ValidateRPCRequest(obj) == true);
		ASSERT_FALSE(jsonRPC.ValidateRPCError(obj) == true);
	}

	// can't have error without error message
	{
		pp::VarDictionary obj;
		obj.Set("jsonrpc","2.0");
		pp::VarDictionary obj_error;
		obj_error.Set("code",-32700);
		obj.Set("error",obj_error);
		obj.Set("id",1);
		ASSERT_FALSE(jsonRPC.ValidateRPCCallback(obj) == true);
		ASSERT_FALSE(jsonRPC.ValidateRPCRequest(obj) == true);
		ASSERT_FALSE(jsonRPC.ValidateRPCError(obj) == true);
	}

	// requests aren't callbacks nor errors
	{
		pp::VarDictionary obj;
		obj.Set("jsonrpc","2.0");
		obj.Set("method","helloWorld");
		pp::VarArray obj_params;
		obj_params.Set(0, "hello!");
		obj.Set("params",obj_params);
		obj.Set("id",1);

		ASSERT_FALSE(jsonRPC.ValidateRPCCallback(obj) == true);
		ASSERT_TRUE(jsonRPC.ValidateRPCRequest(obj) == true);
		ASSERT_FALSE(jsonRPC.ValidateRPCError(obj) == true);
	}
}


// it should validate json-rpc batch calls according to spec
TEST(JSONRPCLayer, ValidateJSONRPCBatchCallsTest){
	// TODO: Batch Calls.
}


// it should send json-rpc requests
TEST(JSONRPCLayer, SendJSONRPCRequestTest){
	// SendRPCRequest with a valid object, check PostMessage called.
	MockRPCTransport transport;
	EXPECT_CALL(transport, PostMessage(_)).Times(1);

	JSONRPC* jsonRPC = new JSONRPC(&transport);

	pp::VarDictionary obj;
	obj.Set("jsonrpc","2.0");
	obj.Set("method","helloWorld");
	pp::VarArray obj_params;
	obj_params.Set(0, "hello!");
	obj.Set("params",obj_params);
	obj.Set("id",1);

	ASSERT_TRUE(jsonRPC->ValidateRPCRequest(obj) == true);

	bool sent = jsonRPC->SendRPCRequest(obj);

	ASSERT_TRUE(sent);

}

// it should fail to send request if transport wasn't provided
TEST(JSONRPCLayer, SendRequestWithoutTransportTest){
	// Construct jsonrpc without transport. check PostMessage NOT called.
	MockRPCTransport transport;
	JSONRPC* jsonRPC = new JSONRPC();

	pp::VarDictionary obj;
	obj.Set("jsonrpc","2.0");
	obj.Set("method","helloWorld");
	pp::VarArray obj_params;
	obj_params.Set(0, "hello!");
	obj.Set("params",obj_params);
	obj.Set("id",1);

	ASSERT_TRUE(jsonRPC->ValidateRPCRequest(obj) == true);

	EXPECT_CALL(transport, PostMessage(_)).Times(0);

	ASSERT_FALSE(jsonRPC->SendRPCRequest(obj) == true);
}


// it should handle json-rpc requests
TEST(JSONRPCLayer, HandleJSONRPCRequestTest){
	// make a new request, call handler, check validator called.

	pp::VarDictionary obj;
	obj.Set("jsonrpc","2.0");
	obj.Set("method","helloWorld");
	pp::VarArray obj_params;
	obj_params.Set(0, "hello!");
	obj.Set("params",obj_params);
	obj.Set("id",1);


	// we use a mock that actually calls the real implementation at the HandleRPC method.
	MockJSONRPC mockJSONRPC;
	EXPECT_CALL(mockJSONRPC, ValidateRPCRequest(obj)).Times(1);
	mockJSONRPC.HandleRPC_concrete(obj);

}


// it should handle json-rpc callbacks
TEST(JSONRPCLayer, HandleJSONRPCCallbacksTest){
	// make a new request, call handler, check validator called.
	pp::VarDictionary obj;
	obj.Set("jsonrpc","2.0");
	obj.Set("result",19);
	obj.Set("id",1);


	// we use a mock that actually calls the real implementation at the HandleRPC method.
	MockJSONRPC mockJSONRPC;
	EXPECT_CALL(mockJSONRPC, ValidateRPCCallback(obj)).Times(1);
	mockJSONRPC.HandleRPC_concrete(obj);
}

// it should handle json-rpc errors
TEST(JSONRPCLayer, HandleJSONRPErrorsTest){
	// make a new request, call handler, check validator called.
	pp::VarDictionary obj;
	obj.Set("jsonrpc","2.0");
	pp::VarDictionary obj_error;
	obj_error.Set("code",-32700);
	obj_error.Set("message","failed to parse");
	obj_error.Set("data","the server failed to parse the message: 123");
	obj.Set("error",obj_error);
	obj.Set("id",1);


	// we use a mock that actually calls the real implementation at the HandleRPC method.
	MockJSONRPC mockJSONRPC;
	EXPECT_CALL(mockJSONRPC, ValidateRPCError(obj)).Times(1);
	mockJSONRPC.HandleRPC_concrete(obj);
}


// it should call runtime methods when handling a json-rpc message, if a runtime is provided
TEST(JSONRPCLayer, HandleCallbacksWithRuntimeTest){
	// todo
}


// it shouldn't call rpc runtime methods if a runtime is not set
TEST(JSONRPCLayer, HandleCallbacksWithoutRuntimeTest){
	// todo
}


// it should construct valid json rpc request objects
TEST(JSONRPCLayer, JSONRPCRequestObjectTest){
	JSONRPC jsonRPC;
	pp::VarArray params;
	params.Set(0, "hello!");
	std::string method = "helloWorld";
	unsigned int id = 1;
	pp::VarDictionary request = jsonRPC.ConstructRPCRequest(method, id, params);

	ASSERT_TRUE(jsonRPC.ValidateRPCRequest(request) == true);

}


// it should construct valid json rpc callback objects
TEST(JSONRPCLayer, JSONRPCCallbackObjectTest){
	JSONRPC jsonRPC;
	pp::Var result(23);
	unsigned int id = 1;

	pp::VarDictionary callback = jsonRPC.ConstructRPCCallback(id, result);
	ASSERT_TRUE(jsonRPC.ValidateRPCCallback(callback) == true);
}


// it should construct valid json rpc error objects
TEST(JSONRPCLayer, JSONRPCErrorObjectTest){
	JSONRPC jsonRPC;
	pp::Var data(23);
	std::string message = "i'm an error message";
	int id = 1;

	pp::VarDictionary errorWithData = jsonRPC.ConstructRPCError(id, -213, message, data);
	pp::VarDictionary errorWithoutData = jsonRPC.ConstructRPCError(id, -213, message);
	ASSERT_TRUE(jsonRPC.ValidateRPCError(errorWithoutData) == true);
	ASSERT_TRUE(jsonRPC.ValidateRPCError(errorWithData) == true);

}
