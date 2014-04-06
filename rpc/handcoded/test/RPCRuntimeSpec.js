define(["RPCRuntime", "JSONRPC", "RPCTransport", "NaClModule", "fakemodule"], function(RPCRuntime, JSONRPC, RPCTransport, NaClModule, fakemodule){
  describe("RPCRuntime Layer", function() {
    var testModuleId = "rpcruntime-layer";
    var fakeAttrs = {src:'rpc-module.nmf', name:'myRPC', id:testModuleId, type:'application/x-pnacl'};

    var myModule, transport, jsonRPC, runtime;


    beforeEach(function() {
      // remove the naclmodule after each test.
      var listenerElement = document.getElementById(testModuleId+'-listener');
      if(listenerElement){
        listenerElement.parentNode.removeChild(listenerElement);
      }
      myModule = fakemodule.createModuleWithFakeEmbed(new NaClModule(fakeAttrs));
      transport = new RPCTransport(myModule);
      jsonRPC = new JSONRPC(transport);
      runtime = new RPCRuntime(jsonRPC);


      // load the transport before each test.
      var loaded = false;
      transport.load(function(){
        loaded = true;
      });

      waitsFor(function(){
        return loaded;
      }, "the module to load", 1000);
    });



    it("should construct only with a json rpc", function(){
      expect(function(){new RPCRuntime(new JSONRPC);}).not.toThrow();
      expect(function(){new RPCRuntime()}).toThrow();
    });



    it("should make a valid request", function(){
      spyOn(myModule.moduleEl, "postMessage");
      runtime.sendRequest("myFunction", ["hello"]);
      expect(jsonRPC.validateRPCRequest(myModule.moduleEl.postMessage.calls[0].args[0])).toBe(true);
    });



    it("should handle rpc messages (requests, callbacks, errrors)", function(){
      spyOn(RPCRuntime.prototype, "handleRequest");
      spyOn(RPCRuntime.prototype, "handleCallback");
      spyOn(RPCRuntime.prototype, "handleError");
      spyOn(RPCTransport.prototype, "handleMessage").andCallThrough();

      // 3 messages
      var callJSON = {
        "jsonrpc": "2.0",
        "method" : "helloWorld",
        "params" : ["hello!"],
        "id"     : 1
      };

      var callbackJSON = {
        "jsonrpc": "2.0",
        "result" : 19,
        "id"     : 1
      };

      var errorJSON = {
        "jsonrpc": "2.0",
        "error" : {
          "code" : -32700,
          "message" : "failed to parse",
          "data"    : "the server failed to parse the message: 123"
        },
        "id"     : 1
      };

      var messageCount = 0;
      myModule.on("message", function(){
        messageCount++;
      });

      myModule.moduleEl.fakeMessage(callJSON);
      myModule.moduleEl.fakeMessage(callbackJSON);
      myModule.moduleEl.fakeMessage(errorJSON);

      waitsFor(function(){
        return messageCount >= 3;
      }, "3 messages to be sent");

      runs(function(){
        expect(messageCount).toEqual(3);
        expect(runtime.handleRequest).toHaveBeenCalled();
        expect(runtime.handleCallback).toHaveBeenCalled();
        expect(runtime.handleError).toHaveBeenCalled();

      });

    });



    it("should match callbacks with requests", function(){
      var successSpy = jasmine.createSpy("successSpy");
      var messageSent = false;
      myModule.on("message", function(){
        messageSent = true;
      });

      // sendRequest returns the id
      var id = runtime.sendRequest("myMethod", ["hello"], successSpy);

      // the module sends a message back
      var result = (new Date()).getTime();
      myModule.moduleEl.fakeMessage(jsonRPC.constructRPCCallback(id, result));

      waitsFor(function(){
        return messageSent;
      }, "the message to be sent");

      runs(function(){
        expect(successSpy).toHaveBeenCalledWith(result);
      });

    });



    it("should match errors with requests", function(){
      var errorSpy = jasmine.createSpy("errorSpy");
      var messageSent = false;
      myModule.on("message", function(){
        messageSent = true;
      });

      // sendRequest returns the id
      var id = runtime.sendRequest("myMethod", ["hello"], undefined, errorSpy);

      // the module sends a message back
      var errorObject = jsonRPC.constructRPCError(id, "-1234", "I am an error message", "And here's some data");
      myModule.moduleEl.fakeMessage(errorObject);

      waitsFor(function(){
        return messageSent;
      }, "the message to be sent");

      runs(function(){
        expect(errorSpy).toHaveBeenCalledWith(errorObject.error);
      });

    });



    it("should handle many simultaneous RPC requests and do the correct callbacks", function(){
      var i;
      var numTests = 10;
      //create numCallbacks number of spies
      var spies = [];
      for(i=0; i<numTests; i++){
        spies.push(jasmine.createSpyObj("cbSpies"+i, ["success", "error"]));
      }

      var messageCount = 0;
      myModule.on("message", function(){
        messageCount++;
      });

      var ids = [];
      for(i=0; i<numTests; i++){
        ids.push(runtime.sendRequest("myFunc"+i, ["params"+i], spies[i].success, spies[i].error));
      }

      // we alternate between successes and calls.
      var resultsAndErrors = [];
      for(i=0; i<numTests; i++){
        if(i%2 === 0){
          // send a callback result!
          var result = (new Date()).getTime()+i;
          resultsAndErrors.push(result);
          myModule.moduleEl.fakeMessage(jsonRPC.constructRPCCallback(ids[i],result),5); // send quickly (5ms)
        } else {
          // send an error!
          var errorObject = jsonRPC.constructRPCError(ids[i], "-1234", "I am an error message", i);
          resultsAndErrors.push(errorObject.error);
          myModule.moduleEl.fakeMessage(errorObject,1); // send quickly (1ms)

        }
      }

      waitsFor(function(){
        return messageCount === numTests;
      }, numTests+" messages to be sent");

      runs(function(){
        for(i=0; i<numTests; i++){
          if(i%2 === 0){
            // check that it was a callback
            expect(spies[i].success).toHaveBeenCalledWith(resultsAndErrors[i]);
            expect(spies[i].error).not.toHaveBeenCalled();
          } else {
            // check that it was an error
            expect(spies[i].error).toHaveBeenCalledWith(resultsAndErrors[i]);
            expect(spies[i].success).not.toHaveBeenCalled();
          }
        }
      });
    });



    it("shouldn't be affected by the order of the RPC responses compared to the order of the RPC requests", function(){
      // same as previous test, only this time the messages received are in random order.
      var i;
      var numTests = 10;
      //create numCallbacks number of spies
      var spies = [];
      for(i=0; i<numTests; i++){
        spies.push(jasmine.createSpyObj("cbSpies"+i, ["success", "error"]));
      }

      var messageCount = 0;
      myModule.on("message", function(){
        messageCount++;
      });

      var ids = [];
      for(i=0; i<numTests; i++){
        ids.push(runtime.sendRequest("myFunc"+i, ["params"+i], spies[i].success, spies[i].error));
      }

      // we alternate between successes and calls.
      var resultsAndErrors = [];
      for(i=0; i<numTests; i++){
        if(i%2 === 0){
          // send a callback result!
          var result = (new Date()).getTime()+i;
          resultsAndErrors.push(result);
          myModule.moduleEl.fakeMessage(jsonRPC.constructRPCCallback(ids[i],result),5); // send quickly (5ms)
        } else {
          // send an error!
          var errorObject = jsonRPC.constructRPCError(ids[i], "-1234", "I am an error message", i);
          resultsAndErrors.push(errorObject.error);
          // send randomly, in a range between 0 and 10 ms
          myModule.moduleEl.fakeMessage(errorObject, Math.floor(Math.random() * 10));

        }
      }

      waitsFor(function(){
        return messageCount === numTests;
      }, numTests+" messages to be sent");

      runs(function(){
        for(i=0; i<numTests; i++){
          if(i%2 === 0){
            // check that it was a callback
            expect(spies[i].success).toHaveBeenCalledWith(resultsAndErrors[i]);
            expect(spies[i].error).not.toHaveBeenCalled();
          } else {
            // check that it was an error
            expect(spies[i].error).toHaveBeenCalledWith(resultsAndErrors[i]);
            expect(spies[i].success).not.toHaveBeenCalled();
          }
        }
      });
    });



    it("should handle C++ - JS requests", function(){
      //TODO
    });



    it("should send errors to C++ when an error is thrown in the JS", function(){
      //TODO
    });



    it("should send results to C++ when a requested rpc is made successfully", function(){
      //TODO
    });



    // maybe it should make batch calls for rpc calls that are made in the same interval
    // e.g. sending 10,000 requests in 5 milliseconds is stupid. Instead, send 1 batch request with 10,000 calls.
    // this is an optimisation that should probably be investigated, since using this technique will probably slow down
    // small rpc calls but speed up request-heavy calls. I'm sure chrome handles calls like this using a queue.
  });
});