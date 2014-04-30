#include "RPCTransport.h"
#include "ppapi/cpp/instance.h"
#include "ppapi/cpp/module.h"
#include "ppapi/cpp/var.h"

#include "JSONRPC.h"

namespace pprpc{
RPCTransport::RPCTransport(PP_Instance instance) : pp::Instance(instance) {
	init(new JSONRPC());
}

RPCTransport::RPCTransport(PP_Instance instance, JSONRPC* jsonRPC) : pp::Instance(instance) {
	init(jsonRPC);
}


void RPCTransport::HandleMessage(const pp::Var& message) {
	if(this->jsonRPC){
		// send it to the json rpc if it's there
		this->jsonRPC->HandleRPC(message);
	}
}

void RPCTransport::PostMessage(const pp::Var& message) {
	pp::Instance::PostMessage(message);
}


RPCTransport::~RPCTransport() {

}

void RPCTransport::init() {
}


void RPCTransport::init(JSONRPC* jsonRPC) {
	this->setJSONRPC(jsonRPC);
}

} /*namespace pprpc*/
