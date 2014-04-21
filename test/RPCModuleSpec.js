define(["RPCModule", "NaClModule", "fakemodule"], function(RPCModule, NaClModule, fakemodule){
  describe("RPC Stub", function() {
    var testModuleId = "rpcmodule-layer";
    var fakeAttrs = {src:'rpc-module.nmf', name:'myRPC', id:testModuleId, type:'application/x-pnacl'};

    var myModule;

    beforeEach(function(){
      // remove the naclmodule after each test.
      var listenerElement = document.getElementById(testModuleId+'-listener');
      if(listenerElement){
        listenerElement.parentNode.removeChild(listenerElement);
      }
      myModule = fakemodule.createModuleWithFakeEmbed(new NaClModule(fakeAttrs));
    });



    it("should construct a module only if we give it a NaClModule", function(){
      expect(function(){
        new RPCModule();
      }).toThrow();

      expect(function(){
        new RPCModule({module: myModule});
      }).not.toThrow();
    });



    it("should accept function specs", function(){
      var rpcModule = new RPCModule({
        module: myModule,
        functions: [
          {
            "name": "myFoo",
            "params" : ["String"]
          },
          {
            "name" : "myFun",
            "params" : ["Long"]
          }
        ]
      });

      expect(rpcModule.myFoo).toBeDefined();
      expect(rpcModule.myFun).toBeDefined();

    });



    it("should allow adding function specs at runtime", function(){
      var rpcModule = new RPCModule({
        module: myModule,
        functions: [
          {
            "name": "myFoo",
            "params" : ["String"]
          }
        ]
      });

      RPCModule.addStubToModule(rpcModule, {
        "name" : "myFun",
        "params" : ["Long"]
      });

      expect(rpcModule.myFoo).toBeDefined();
      expect(rpcModule.myFun).toBeDefined();
    });


    it("should generate functions that make RPC calls", function(done){
      var id;
      spyOn(myModule.moduleEl, "postMessage").and.callFake(function(dataToSend){
        expect(dataToSend).toEqual({
          "jsonrpc": "2.0",
          "id": id,
          "method": "myFoo",
          "params": ["hello world"]
        });
        done();
      });

      var rpcModule = new RPCModule({
        module: myModule,
        functions: [
          {
            "name": "myFoo",
            "params" : ["DOMString"]
          }
        ]
      });

      id = rpcModule.myFoo("hello world");
    });



    it("should handle successful result callbacks", function(done){
      var rpcModule = new RPCModule({
        module: myModule,
        functions: [
          {
            "name": "myFoo",
            "params" : ["String"],
            "returnType" : "Long"
          }
        ]
      });

      var successSpy = jasmine.createSpy("successSpy");
      var errorSpy = jasmine.createSpy("errorSpy");

      spyOn(myModule.moduleEl, "postMessage").and.callFake(function(){
        // when we post message, reply back.
        myModule.moduleEl.fakeMessage({
          "jsonrpc": "2.0",
          "result": 23,
          "id": id
        });

      });

      // the module will then receive the message.
      // check that the rpc call's callback was called.
      myModule.on("message", function(){
        expect(successSpy).toHaveBeenCalledWith(23);
        expect(errorSpy).not.toHaveBeenCalled();
        done();
      });

      var id = rpcModule.myFoo("hello world", successSpy, errorSpy);

    });



    it("should handle error callbacks", function(done){
      var rpcModule = new RPCModule({
        module: myModule,
        functions: [
          {
            "name": "myFoo",
            "params" : ["String"],
            "returnType" : "Long"
          }
        ]
      });

      var successSpy = jasmine.createSpy("successSpy");
      var errorSpy = jasmine.createSpy("errorSpy");

      spyOn(myModule.moduleEl, "postMessage").and.callFake(function(){
        // when we post message, reply back with error.
        myModule.moduleEl.fakeMessage({
          "jsonrpc": "2.0",
          "error": {
            "code": -23,
            "message" : "the function on the server failed! :("
          },
          "id": id
        });

      });

      // the module will then receive the message.
      // check that the rpc call's callback was called.
      myModule.on("message", function(){
        expect(successSpy).not.toHaveBeenCalled();
        expect(errorSpy).toHaveBeenCalledWith({
          "code": -23,
          "message" : "the function on the server failed! :("
        });
        done();
      });

      var id = rpcModule.myFoo("hello world", successSpy, errorSpy);


    });

  });
});