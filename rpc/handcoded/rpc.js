function moduleDidLoad() {
  common.hideModule();
  common.naclModule.postMessage('hello');
}

function handleMessage(message) {
  console.log(message.data);
  d = message.data;
  if(d.jsonrpc && d.jsonrpc == "2.0"){
  	// RPC call
  	rpcfunctions = {
  		"log": function(data) {
  			console.log(data);
  		}
  	};
  	if (rpcfunctions[d.method] != undefined && d.params != undefined) {
  		rpcfunctions[d.method].apply(this, d.params);
  	};
  }
}
