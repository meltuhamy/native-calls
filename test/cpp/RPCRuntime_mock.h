#include "gmock/gmock.h"
#include "ppapi/cpp/var.h"
#include "ppapi/cpp/var_array.h"
#include "nativecalls/RPCRuntime.h"

using namespace pprpc;
class MockRPCRuntime: public RPCRuntime{
public:
	MOCK_METHOD2(AddFunctor, bool(std::string name, RPCServerStub* functor));
	MOCK_METHOD1(GetFunctor, RPCServerStub*(std::string name));
	MOCK_METHOD3(CallFunctor, pp::Var(std::string name, const pp::VarArray* params, RPCError& error));

	MOCK_METHOD1(HandleRequest, bool(const pp::Var& request));
	MOCK_METHOD1(HandleRequest, bool(const RPCRequest& request));
};
