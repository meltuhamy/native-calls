function moduleDidLoad() {
  common.hideModule();
  common.naclModule.postMessage('hello');
}

function handleMessage(message) {
  // console.log(message.data);
  d = message.data;
  if(d.jsonrpc && d.jsonrpc == "2.0"){
  	// It's a RPC call
  	if (RPCReceiveFunctions[d.method] != undefined && d.params != undefined) {
  		RPCReceiveFunctions[d.method].apply(this, d.params);
  	};
  }
}
