define(["common"], function(common){
	return {
		echo: function(data) {
			// goes to the server with data, 
			// the server should do a rpc-console.log
			this.sendRPC(this.constructRPC("echo", [data]), function(data){
				// Come back here when the data comes back.
				console.log("In callback:"+JSON.stringify(data));
			});
		},
		consoleLogTester: function(data){
			// asks the server to do some awesome console logging
			this.sendRPC(this.constructRPC("consoleLogTester", []));
		},
		constructRPC: function(method, argumentsArray){
			// constructs a json-rpc object
			return {
				"json-rpc": "2.0",
				"method": method,
				"params": argumentsArray,
				"id" : this.id++
			};
		},
		id: 0,
		RPCCallbacks: {},
		sendRPC: function(data, callback){
			if(callback != undefined){
				this.RPCCallbacks[data.id] = callback;
			}
			common.naclModule.postMessage(data);
		}
	};

});
