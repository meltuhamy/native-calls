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
            "params" : ["Integer"]
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
        "params" : ["Integer"]
      });

      expect(rpcModule.myFoo).toBeDefined();
      expect(rpcModule.myFun).toBeDefined();
    });


    it("should generate functions that make RPC calls", function(){
      var loaded = false;
      myModule.on("load", function(){
        loaded = true;
      });

      spyOn(myModule.moduleEl, "postMessage");

      var rpcModule = new RPCModule({
        module: myModule,
        functions: [
          {
            "name": "myFoo",
            "params" : ["String"]
          }
        ]
      });

      var id = rpcModule.myFoo("hello world");

      // the module wasn't loaded. We expect the rpc call to make the module load. Wait for it to load.
      waitsFor(function(){
        return loaded;
      }, "the module to load");

      runs(function(){
        expect(myModule.moduleEl.postMessage).toHaveBeenCalledWith({
          "jsonrpc": "2.0",
          "id": id,
          "method": "myFoo",
          "params": ["hello world"]
        });
      });
    });



    it("should handle successful result callbacks", function(){
      var loaded = false;
      myModule.on("load", function(){
        loaded = true;
      });

      var rpcModule = new RPCModule({
        module: myModule,
        functions: [
          {
            "name": "myFoo",
            "params" : ["String"],
            "returnType" : "Integer"
          }
        ]
      });
      var successSpy = jasmine.createSpy("successSpy");
      var errorSpy = jasmine.createSpy("errorSpy");
      var id = rpcModule.myFoo("hello world", successSpy, errorSpy);

      // the module wasn't loaded. We expect the rpc call to make the module load. Wait for it to load.
      waitsFor(function(){
        return loaded;
      }, "the module to load");

      var messageSent = false;
      myModule.on("message", function(){
        messageSent = true;
      });

      runs(function(){
        // now, make the fake callback
        myModule.moduleEl.fakeMessage({
          "jsonrpc": "2.0",
          "result": 23,
          "id": id
        });
      });

      waitsFor(function(){
        return messageSent;
      }, "the message to be sent");

      runs(function(){
        expect(successSpy).toHaveBeenCalledWith(23);
        expect(errorSpy).not.toHaveBeenCalled();
      });
    });



    it("should handle error callbacks", function(){
      var loaded = false;
      myModule.on("load", function(){
        loaded = true;
      });

      var rpcModule = new RPCModule({
        module: myModule,
        functions: [
          {
            "name": "myFoo",
            "params" : ["String"],
            "returnType" : "Integer"
          }
        ]
      });
      var successSpy = jasmine.createSpy("successSpy");
      var errorSpy = jasmine.createSpy("errorSpy");
      var id = rpcModule.myFoo("hello world", successSpy, errorSpy);

      // the module wasn't loaded. We expect the rpc call to make the module load. Wait for it to load.
      waitsFor(function(){
        return loaded;
      }, "the module to load");

      var messageSent = false;
      runs(function(){
        // now, make the fake callback
        myModule.on("message", function(){
          messageSent = true;
        });

        myModule.moduleEl.fakeMessage({
          "jsonrpc": "2.0",
          "error": {
            "code": -23,
            "message" : "the function on the server failed! :("
          },
          "id": id
        });
      });

      waitsFor(function(){
        return messageSent;
      }, "the message to be sent");

      runs(function(){
        expect(successSpy).not.toHaveBeenCalled();
        expect(errorSpy).toHaveBeenCalledWith({
          "code": -23,
          "message" : "the function on the server failed! :("
        });
      });
    });

  });
});