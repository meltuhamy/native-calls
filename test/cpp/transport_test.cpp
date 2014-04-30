#include "JSONRPC_mock.h"
#include "gmock/gmock.h"
#include "gtest/gtest.h"
#include "RPCTransport.h"
#include "ppapi/cpp/instance.h"

using namespace pprpc;

using ::testing::AtLeast;
using ::testing::_;

PP_Instance instanceId = 2;


// it should construct without a json-rpc layer
TEST(RPCTransport, EmptyConstructorTest){
	ASSERT_NO_THROW(new RPCTransport(instanceId++););
}

// it should construct with a json rpc layer
TEST(RPCTransport, JSONRPCConstructorTest){
	MockJSONRPC mockJSONRPC;
	ASSERT_NO_THROW(new RPCTransport(instanceId++, &mockJSONRPC););
}


// it should handle messages coming from the module
// i.e. it should inherit from pp::Instance
TEST(RPCTransport, HandleMessagesTest){
	// we make a RPCTransport
	RPCTransport *myTransport = new RPCTransport(instanceId++);

	// then cast it to instance
	pp::Instance *myInstance = myTransport;

	ASSERT_EQ(myTransport,myInstance);

}

// it should pass messages on to the json-rpc layer if constructed with one
TEST(RPCTransport, HandleMessageToJSONRPCTest){
	pp::Var message("test message");
	MockJSONRPC mockJSONRPC;
	EXPECT_CALL(mockJSONRPC, HandleRPC(message)).Times(AtLeast(1));

	RPCTransport *myTransport = new RPCTransport(instanceId++, &mockJSONRPC);
	myTransport->HandleMessage(message);

}
