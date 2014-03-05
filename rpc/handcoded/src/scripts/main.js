require(["common", "rpc-receive", "rpc-send", "rpc"], function(common, RPCRecieve, RPCSend, RPC) {
	window.common = common;
	window.RPCRecieve = RPCRecieve;
	window.RPCSend = RPCSend;
	window.RPC = RPC;
	window.handleMessage = RPC.handleMessage;
	window.moduleDidLoad = RPC.moduleDidLoad;
	common.createNaClModule("rpc-module",'pnacl','.',1,1);
});