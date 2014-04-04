define(["JSONRPC", "RPCTransport", "NaClModule", "fakemodule"], function(JSONRPC, RPCTransport, NaClModule, fakemodule){
  describe("JSONRPC Layer", function() {
    var testModuleId = "jsonrpc-layer";
    var fakeAttrs = {src:'rpc-module.nmf', name:'myRPC', id:testModuleId, type:'application/x-pnacl'};

    var myModule, transport;

    beforeEach(function() {
      // remove the naclmodule after each test.
      var listenerElement = document.getElementById(testModuleId+'-listener');
      if(listenerElement){
        listenerElement.parentNode.removeChild(listenerElement);
      }
      myModule = fakemodule.createModuleWithFakeEmbed(new NaClModule(fakeAttrs));
      transport = new RPCTransport(myModule);
    });



    it("should construct with/without a transport", function(){
      var jsonRPC = new JSONRPC(transport);
      expect(jsonRPC).toBeDefined();
    });



    it("should update the transport when constructed with one", function(){
      spyOn(RPCTransport.prototype, "setJSONRPC");
      var transport = new RPCTransport(myModule);
      var jsonRPC = new JSONRPC(transport);
      expect(transport.setJSONRPC).toHaveBeenCalledWith(jsonRPC);
    });



    //spec: http://www.jsonrpc.org/specification#request_object
    it("should validate json-rpc requests according to spec", function(){
      // passing cases
      // request (4)
      expect(JSONRPC.prototype.validateRPCRequest({
        "jsonrpc": "2.0",
        "method" : "helloWorld",
        "params" : ["hello!"],
        "id"     : 1
      })).toBe(true);

      //string id
      expect(JSONRPC.prototype.validateRPCRequest({
        "jsonrpc": "2.0",
        "method" : "helloWorld",
        "params" : ["hello!"],
        "id"     : "mymethod1"
      })).toBe(true);

      // null id
      expect(JSONRPC.prototype.validateRPCRequest({
        "jsonrpc": "2.0",
        "method" : "helloWorld",
        "params" : ["hello!"],
        "id"     : null
      })).toBe(true);

      // notification (4.1)
      expect(JSONRPC.prototype.validateRPCRequest({
        "jsonrpc": "2.0",
        "method" : "helloWorld",
        "params" : ["hello!"]
      })).toBe(true);

      // without params
      expect(JSONRPC.prototype.validateRPCRequest({
        "jsonrpc": "2.0",
        "method" : "helloWorld",
        "id"     : 1
      })).toBe(true);

      // failing cases
      // without jsonrpc
      expect(JSONRPC.prototype.validateRPCRequest({
        "method" : "helloWorld",
        "params" : ["hello!"],
        "id"     : 1
      })).toBe(false);

      // bogus jsonrpc
      expect(JSONRPC.prototype.validateRPCRequest({
        "jsonrpc": "hello",
        "method" : "helloWorld",
        "params" : ["hello!"],
        "id"     : 1
      })).toBe(false);

      // non string method
      expect(JSONRPC.prototype.validateRPCRequest({
        "jsonrpc": "2.0",
        "method" : 1163936,
        "params" : ["hello!"],
        "id"     : 1
      })).toBe(false);

      // non string/number/null id
      expect(JSONRPC.prototype.validateRPCRequest({
        "jsonrpc": "2.0",
        "method" : "helloWorld",
        "params" : ["hello!"],
        "id"     : {"this": "should fail."}
      })).toBe(false);

      // fractional id
      expect(JSONRPC.prototype.validateRPCRequest({
        "jsonrpc": "2.0",
        "method" : "helloWorld",
        "params" : ["hello!"],
        "id"     : 2/3
      })).toBe(false);

      // not a request
      expect(JSONRPC.prototype.validateRPCRequest({
        "jsonrpc": "2.0",
        "result" : 19,
        "id"     : 1
      })).toBe(true);

    });



    // spec: http://www.jsonrpc.org/specification#response_object
    it("should validate json-rpc callbacks according to spec", function(){
      var json; //we shall test json with different methods
      // passing cases
      expect(JSONRPC.prototype.validateRPCCallback(json = {
        "jsonrpc": "2.0",
        "result" : 19,
        "id"     : 1
      })).toBe(true);
      expect(JSONRPC.prototype.validateRPCError(json)).toBe(false);
      expect(JSONRPC.prototype.validateRPCRequest(json)).toBe(false);

      expect(JSONRPC.prototype.validateRPCCallback({
        "jsonrpc": "2.0",
        "result" : 19,
        "id"     : "myID1"
      })).toBe(true);
      expect(JSONRPC.prototype.validateRPCError(json)).toBe(false);
      expect(JSONRPC.prototype.validateRPCRequest(json)).toBe(false);

      expect(JSONRPC.prototype.validateRPCError({
        "jsonrpc": "2.0",
        "error" : {
          "code" : -32700,
          "message" : "failed to parse",
          "data"    : "the server failed to parse the message: 123"
        },
        "id"     : 1
      })).toBe(true);

      expect(JSONRPC.prototype.validateRPCError({
        "jsonrpc": "2.0",
        "error" : {
          "code" : -32700,
          "message" : "failed to parse"
        },
        "id"     : 1
      })).toBe(true);


      // failing cases
      // without jsonrpc
      json = {
        "result" : 19,
        "id"     : 1
      };
      expect(JSONRPC.prototype.validateRPCCallback(json)).toBe(false);
      expect(JSONRPC.prototype.validateRPCError(json)).toBe(false);

      // can't have both result and error
      expect(JSONRPC.prototype.validateRPCCallback(json = {
        "jsonrpc": "2.0",
        "result" : 19,
        "error"  : {},
        "id"     : 1
      })).toBe(false);
      expect(JSONRPC.prototype.validateRPCError(json)).toBe(false);
      expect(JSONRPC.prototype.validateRPCRequest(json)).toBe(false);

      expect(JSONRPC.prototype.validateRPCCallback(json = {
        "jsonrpc": "2.0",
        "result": 23,
        "error" : {
          "code" : -32700,
          "message" : "failed to parse",
          "data"    : "the server failed to parse the message: 123"
        },
        "id"     : 1
      })).toBe(false);
      expect(JSONRPC.prototype.validateRPCError(json)).toBe(false);
      expect(JSONRPC.prototype.validateRPCRequest(json)).toBe(false);


      // can't have an error without error object
      expect(JSONRPC.prototype.validateRPCCallback(json = {
        "jsonrpc": "2.0",
        "error" : 19,
        "id"     : 1
      })).toBe(false);
      expect(JSONRPC.prototype.validateRPCError(json)).toBe(false);
      expect(JSONRPC.prototype.validateRPCRequest(json)).toBe(false);


      // can't have an error without error code
      expect(JSONRPC.prototype.validateRPCCallback(json = {
        "jsonrpc": "2.0",
        "error" : {
          "message" : "failed"
        },
        "id"     : 1
      })).toBe(false);
      expect(JSONRPC.prototype.validateRPCError(json)).toBe(false);
      expect(JSONRPC.prototype.validateRPCRequest(json)).toBe(false);


      // can't have an error without error message
      expect(JSONRPC.prototype.validateRPCCallback(json = {
        "jsonrpc": "2.0",
        "error" : {
          "code" : -32700
        },
        "id"     : 1
      })).toBe(false);
      expect(JSONRPC.prototype.validateRPCError(json)).toBe(false);
      expect(JSONRPC.prototype.validateRPCRequest(json)).toBe(false);



    });



    // spec: http://www.jsonrpc.org/specification#batch
    it("should validate json-rpc batch calls according to spec", function(){
      throw new Error("Fix failing test");

    });



    it("should send json-rpc requests", function(){
      throw new Error("Fix failing test");

      // new request
      // check validate called
      // check postMessage called
    });



    it("should fail to send request if transport wasn't provided", function(){
      throw new Error("Fix failing test");

    });



    it("should handle json-rpc callbacks", function(){
      throw new Error("Fix failing test");

      // fakemessage with json callback
      // check validate called

    });



  });
});