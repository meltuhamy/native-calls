#include "RPCTransport.h"
#include "ppapi/cpp/instance.h"
#include "ppapi/cpp/module.h"
#include "ppapi/cpp/var.h"

#include "JSONRPC.h"

RPCTransport::RPCTransport(PP_Instance instance) : pp::Instance(instance) {
	init(new JSONRPC());
}

RPCTransport::RPCTransport(PP_Instance instance, JSONRPC* jsonRPC) : pp::Instance(instance) {
	init(jsonRPC);
}


void RPCTransport::HandleMesasge(const pp::Var& message) {
	if(this->jsonRPC){
		// send it to the json rpc
		this->jsonRPC->HandleRPC(message);
	}
}

RPCTransport::~RPCTransport() {

}

void RPCTransport::init() {
}

void RPCTransport::init(JSONRPC* jsonRPC) {
	this->setJSONRPC(jsonRPC);
}
