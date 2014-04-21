define(["JSONRPC", "RPCTransport", "NaClModule", "fakemodule"], function (JSONRPC, RPCTransport, NaClModule, fakemodule) {
  describe("JSONRPC Layer", function () {
    var testModuleId = "jsonrpc-layer";
    var fakeAttrs = {src: 'rpc-module.nmf', name: 'myRPC', id: testModuleId, type: 'application/x-pnacl'};

    var myModule, transport, rpcRuntime;


    beforeEach(function (done) {
      // remove the naclmodule after each test.
      var listenerElement = document.getElementById(testModuleId + '-listener');
      if (listenerElement) {
        listenerElement.parentNode.removeChild(listenerElement);
      }
      myModule = fakemodule.createModuleWithFakeEmbed(new NaClModule(fakeAttrs));
      transport = new RPCTransport(myModule);
      rpcRuntime = jasmine.createSpyObj("rpcRuntime", ["setJSONRPC", "handleRequest", "handleCallback", "handleError"])

      // load the transport before each test.
      transport.load(function () {
        done();
      });

    });


    it("should construct with/without a transport", function () {
      var jsonRPC = new JSONRPC(transport);
      expect(jsonRPC).toBeDefined();
    });


    it("should update the transport when constructed with one", function () {
      spyOn(RPCTransport.prototype, "setJSONRPC");
      var transport = new RPCTransport(myModule);
      var jsonRPC = new JSONRPC(transport);
      expect(transport.setJSONRPC).toHaveBeenCalledWith(jsonRPC);
    });


    //spec: http://www.jsonrpc.org/specification#request_object
    it("should validate json-rpc requests according to spec", function () {
      // passing cases
      // request (4)
      expect(JSONRPC.prototype.validateRPCRequest({
        "jsonrpc": "2.0",
        "method": "helloWorld",
        "params": ["hello!"],
        "id": 1
      })).toBe(true);

      //string id
      expect(JSONRPC.prototype.validateRPCRequest({
        "jsonrpc": "2.0",
        "method": "helloWorld",
        "params": ["hello!"],
        "id": "mymethod1"
      })).toBe(true);

      // null id
      expect(JSONRPC.prototype.validateRPCRequest({
        "jsonrpc": "2.0",
        "method": "helloWorld",
        "params": ["hello!"],
        "id": null
      })).toBe(true);

      // notification (4.1)
      expect(JSONRPC.prototype.validateRPCRequest({
        "jsonrpc": "2.0",
        "method": "helloWorld",
        "params": ["hello!"]
      })).toBe(true);

      // without params
      expect(JSONRPC.prototype.validateRPCRequest({
        "jsonrpc": "2.0",
        "method": "helloWorld",
        "id": 1
      })).toBe(true);

      // failing cases
      // without jsonrpc
      expect(JSONRPC.prototype.validateRPCRequest({
        "method": "helloWorld",
        "params": ["hello!"],
        "id": 1
      })).toBe(false);

      // bogus jsonrpc
      expect(JSONRPC.prototype.validateRPCRequest({
        "jsonrpc": "hello",
        "method": "helloWorld",
        "params": ["hello!"],
        "id": 1
      })).toBe(false);

      // non string method
      expect(JSONRPC.prototype.validateRPCRequest({
        "jsonrpc": "2.0",
        "method": 1163936,
        "params": ["hello!"],
        "id": 1
      })).toBe(false);

      // non string/number/null id
      expect(JSONRPC.prototype.validateRPCRequest({
        "jsonrpc": "2.0",
        "method": "helloWorld",
        "params": ["hello!"],
        "id": {"this": "should fail."}
      })).toBe(false);

      // fractional id
      expect(JSONRPC.prototype.validateRPCRequest({
        "jsonrpc": "2.0",
        "method": "helloWorld",
        "params": ["hello!"],
        "id": 2 / 3
      })).toBe(false);

      // not a request
      expect(JSONRPC.prototype.validateRPCRequest({
        "jsonrpc": "2.0",
        "result": 19,
        "id": 1
      })).toBe(false);

    });


    // spec: http://www.jsonrpc.org/specification#response_object
    it("should validate json-rpc callbacks according to spec", function () {
      var json; //we shall test json with different methods
      // passing cases
      expect(JSONRPC.prototype.validateRPCCallback(json = {
        "jsonrpc": "2.0",
        "result": 19,
        "id": 1
      })).toBe(true);
      expect(JSONRPC.prototype.validateRPCError(json)).toBe(false);
      expect(JSONRPC.prototype.validateRPCRequest(json)).toBe(false);

      expect(JSONRPC.prototype.validateRPCCallback({
        "jsonrpc": "2.0",
        "result": 19,
        "id": "myID1"
      })).toBe(true);
      expect(JSONRPC.prototype.validateRPCError(json)).toBe(false);
      expect(JSONRPC.prototype.validateRPCRequest(json)).toBe(false);

      expect(JSONRPC.prototype.validateRPCError({
        "jsonrpc": "2.0",
        "error": {
          "code": -32700,
          "message": "failed to parse",
          "data": "the server failed to parse the message: 123"
        },
        "id": 1
      })).toBe(true);

      expect(JSONRPC.prototype.validateRPCError({
        "jsonrpc": "2.0",
        "error": {
          "code": -32700,
          "message": "failed to parse"
        },
        "id": 1
      })).toBe(true);


      // failing cases
      // without jsonrpc
      json = {
        "result": 19,
        "id": 1
      };
      expect(JSONRPC.prototype.validateRPCCallback(json)).toBe(false);
      expect(JSONRPC.prototype.validateRPCError(json)).toBe(false);

      // can't have both result and error
      expect(JSONRPC.prototype.validateRPCCallback(json = {
        "jsonrpc": "2.0",
        "result": 19,
        "error": {},
        "id": 1
      })).toBe(false);
      expect(JSONRPC.prototype.validateRPCError(json)).toBe(false);
      expect(JSONRPC.prototype.validateRPCRequest(json)).toBe(false);

      expect(JSONRPC.prototype.validateRPCCallback(json = {
        "jsonrpc": "2.0",
        "result": 23,
        "error": {
          "code": -32700,
          "message": "failed to parse",
          "data": "the server failed to parse the message: 123"
        },
        "id": 1
      })).toBe(false);
      expect(JSONRPC.prototype.validateRPCError(json)).toBe(false);
      expect(JSONRPC.prototype.validateRPCRequest(json)).toBe(false);

      // can't have a response without an id!
      expect(JSONRPC.prototype.validateRPCCallback(json = {
        "jsonrpc": "2.0",
        "result": 19,
        "error": {}
      })).toBe(false);
      expect(JSONRPC.prototype.validateRPCError(json)).toBe(false);
      expect(JSONRPC.prototype.validateRPCRequest(json)).toBe(false);

      expect(JSONRPC.prototype.validateRPCCallback(json = {
        "jsonrpc": "2.0",
        "result": 23,
        "error": {
          "code": -32700,
          "message": "failed to parse",
          "data": "the server failed to parse the message: 123"
        }
      })).toBe(false);
      expect(JSONRPC.prototype.validateRPCError(json)).toBe(false);
      expect(JSONRPC.prototype.validateRPCRequest(json)).toBe(false);


      // can't have an error without error object
      expect(JSONRPC.prototype.validateRPCCallback(json = {
        "jsonrpc": "2.0",
        "error": 19,
        "id": 1
      })).toBe(false);
      expect(JSONRPC.prototype.validateRPCError(json)).toBe(false);
      expect(JSONRPC.prototype.validateRPCRequest(json)).toBe(false);


      // can't have an error without error code
      expect(JSONRPC.prototype.validateRPCCallback(json = {
        "jsonrpc": "2.0",
        "error": {
          "message": "failed"
        },
        "id": 1
      })).toBe(false);
      expect(JSONRPC.prototype.validateRPCError(json)).toBe(false);
      expect(JSONRPC.prototype.validateRPCRequest(json)).toBe(false);


      // can't have an error without error message
      expect(JSONRPC.prototype.validateRPCCallback(json = {
        "jsonrpc": "2.0",
        "error": {
          "code": -32700
        },
        "id": 1
      })).toBe(false);
      expect(JSONRPC.prototype.validateRPCError(json)).toBe(false);
      expect(JSONRPC.prototype.validateRPCRequest(json)).toBe(false);


    });


    // spec: http://www.jsonrpc.org/specification#batch
    it("should validate json-rpc batch calls according to spec", function () {
      // TODO: Implement batch calls
    });


    it("should construct valid json rpc request objects", function () {
      var jsonRPC = new JSONRPC(transport);
      var constructed = jsonRPC.constructRPCRequest("myFunction", 12, ["hello", "world"]);
      expect(jsonRPC.validateRPCRequest(constructed)).toBe(true);
    });


    it("should construct valid json rpc callback objects", function () {
      var jsonRPC = new JSONRPC(transport);
      var constructed = jsonRPC.constructRPCCallback(12, 123);
      expect(jsonRPC.validateRPCCallback(constructed)).toBe(true);
    });


    it("should construct valid json rpc error objects", function () {
      var jsonRPC = new JSONRPC(transport);
      var constructed = jsonRPC.constructRPCError(12, -113, "Parsing failed", "Extra error data");
      expect(jsonRPC.validateRPCError(constructed)).toBe(true);

    });


    it("should send json-rpc requests", function () {
      // new request
      spyOn(JSONRPC.prototype, "validateRPCRequest").and.callThrough();
      spyOn(myModule, "postMessage");

      var request = {
            "jsonrpc": "2.0",
            "method": "helloWorld",
            "params": ["hello!"],
            "id": 1
          },
          jsonRPC = new JSONRPC(transport);

      jsonRPC.sendRPCRequest(request);

      // check validate called
      expect(jsonRPC.validateRPCRequest).toHaveBeenCalled();

      // check postMessage called
      expect(myModule.postMessage).toHaveBeenCalled();
    });


    it("should fail to send request if transport wasn't provided", function () {
      // new request
      spyOn(JSONRPC.prototype, "validateRPCRequest").and.callThrough();
      spyOn(myModule, "postMessage");

      var request = {
            "jsonrpc": "2.0",
            "method": "helloWorld",
            "params": ["hello!"],
            "id": 1
          },
          jsonRPC = new JSONRPC();


      expect(function () {
        jsonRPC.sendRPCRequest(request);
      }).toThrow();

      // check postMessage called
      expect(myModule.postMessage).not.toHaveBeenCalled();
    });


    it("should handle json-rpc requests", function (done) {
      spyOn(JSONRPC.prototype, "handleRPCCallback").and.callThrough();
      spyOn(JSONRPC.prototype, "validateRPCRequest").and.callThrough();
      var jsonRPC = new JSONRPC(transport, rpcRuntime);

      var callJSON = {
        "jsonrpc": "2.0",
        "method": "helloWorld",
        "params": ["hello!"],
        "id": 1
      };

      myModule.on("message", function () {
        expect(jsonRPC.handleRPCCallback).toHaveBeenCalled();
        expect(jsonRPC.validateRPCRequest).toHaveBeenCalled();
        done();
      });
      myModule.moduleEl.fakeMessage(callJSON);

    });


    it("should handle json-rpc callbacks", function (done) {
      spyOn(JSONRPC.prototype, "handleRPCCallback").and.callThrough();
      spyOn(JSONRPC.prototype, "validateRPCCallback").and.callThrough();
      var jsonRPC = new JSONRPC(transport, rpcRuntime);

      var callbackJSON = {
        "jsonrpc": "2.0",
        "result": 19,
        "id": 1
      };
      myModule.on("message", function () {
        expect(jsonRPC.handleRPCCallback).toHaveBeenCalled();
        expect(jsonRPC.validateRPCCallback).toHaveBeenCalled();
        done();
      });

      myModule.moduleEl.fakeMessage(callbackJSON);

    });


    it("should handle json-rpc errors", function (done) {
      spyOn(JSONRPC.prototype, "handleRPCCallback").and.callThrough();
      spyOn(JSONRPC.prototype, "validateRPCError").and.callThrough();
      var jsonRPC = new JSONRPC(transport, rpcRuntime);

      var errorJSON = {
        "jsonrpc": "2.0",
        "error": {
          "code": -32700,
          "message": "failed to parse",
          "data": "the server failed to parse the message: 123"
        },
        "id": 1
      };
      myModule.on("message", function () {
        expect(jsonRPC.handleRPCCallback).toHaveBeenCalled();
        expect(jsonRPC.validateRPCError).toHaveBeenCalled();
        done();
      });

      myModule.moduleEl.fakeMessage(errorJSON);

    });


    it("should call runtime methods when handling a json-rpc message, if a runtime is provided", function (done) {
      new JSONRPC(transport, rpcRuntime);

      // 3 cases to check: call, callback, and error
      var callJSON = {
        "jsonrpc": "2.0",
        "method": "helloWorld",
        "params": ["hello!"],
        "id": 1
      };

      var callbackJSON = {
        "jsonrpc": "2.0",
        "result": 19,
        "id": 1
      };

      var errorJSON = {
        "jsonrpc": "2.0",
        "error": {
          "code": -32700,
          "message": "failed to parse",
          "data": "the server failed to parse the message: 123"
        },
        "id": 1
      };


      myModule.moduleEl.fakeMessage(callJSON);
      myModule.moduleEl.fakeMessage(callbackJSON);
      myModule.moduleEl.fakeMessage(errorJSON);

      // send all the json-rpc messages from the module
      var messageCount = 0;
      myModule.on("message", function () {
        messageCount++;
        if (messageCount >= 3) {
          expect(rpcRuntime.handleRequest).toHaveBeenCalled();
          expect(rpcRuntime.handleCallback).toHaveBeenCalled();
          expect(rpcRuntime.handleError).toHaveBeenCalled();
          done();
        }
      });
    });


    it("shouldn't call rpc runtime methods if a runtime is not set", function (done) {
      spyOn(console, "error");
      new JSONRPC(transport);

      // 3 cases to check: call, callback, and error
      var callJSON = {
        "jsonrpc": "2.0",
        "method": "helloWorld",
        "params": ["hello!"],
        "id": 1
      };

      var callbackJSON = {
        "jsonrpc": "2.0",
        "result": 19,
        "id": 1
      };

      var errorJSON = {
        "jsonrpc": "2.0",
        "error": {
          "code": -32700,
          "message": "failed to parse",
          "data": "the server failed to parse the message: 123"
        },
        "id": 1
      };


      // send all the json-rpc messages from the module
      var messageCount = 0;
      myModule.on("message", function () {
        messageCount++;
        if (messageCount >= 3) {
          expect(rpcRuntime.handleRequest).not.toHaveBeenCalled();
          expect(rpcRuntime.handleCallback).not.toHaveBeenCalled();
          expect(rpcRuntime.handleError).not.toHaveBeenCalled();
          expect(console.error.calls.count()).toEqual(3); //should print 3 error messages
          done();
        }
      });

      myModule.moduleEl.fakeMessage(callJSON);
      myModule.moduleEl.fakeMessage(callbackJSON);
      myModule.moduleEl.fakeMessage(errorJSON);
    });


  });
});