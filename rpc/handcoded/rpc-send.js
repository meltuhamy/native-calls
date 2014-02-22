window.RPCSendFunctions = {
	"echo": function(data) {
		// goes to the server with data, 
		// the server should do a rpc-console.log
		common.naclModule.postMessage(this.constructRPC("echo", [data]));
	},
	"consoleLogTester": function(data){
		// asks the server to do some awesome console logging
		common.naclModule.postMessage(this.constructRPC("consoleLogTester", []));
	},
	"constructRPC": function(method, argumentsArray){
		// constructs a json-rpc object
		return {
			"json-rpc": "2.0",
			"method": method,
			"params": argumentsArray
		};
	}
};