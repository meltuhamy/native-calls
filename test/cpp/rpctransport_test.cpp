#include "gtest/gtest.h"
#include "RPCTransport.h"

// mock the JSONRPC
class RPCRuntime;
class JSONRPC{
public:
	JSONRPC(){}
	virtual ~JSONRPC(){}

	bool is_basic_json_rpc(pp::Var obj){ return true;}

	bool ValidateRPCRequest(pp::Var requestObj){ return true;}

	bool ValidateRPCCallback(pp::Var callbackObj){ return true; }

	bool ValidateRPCError(pp::Var errorObj){ return true; }

	void HandleRPC(pp::Var rpcObj){ return; }

	void SendRPCRequst(pp::Var rpcObj){ return; }

};

JSONRPC *jsonRPCMock = new JSONRPC();
RPCTransport transport(123, jsonRPCMock);

TEST(RPCTransportCase, ConstructorTest){


	ASSERT_EQ(1,0);
}
