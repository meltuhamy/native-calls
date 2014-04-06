define(["RPCStub", "RPCRuntime", "JSONRPC", "RPCTransport", "fakemodule", "NaClModule"], function(RPCStub, RPCRuntime, JSONRPC, RPCTransport, fakemodule, NaClModule){
  describe("RPC Stub", function() {
    var runtimeMock;
    var testModuleId = "rpcruntime-layer";
    var fakeAttrs = {src:'rpc-module.nmf', name:'myRPC', id:testModuleId, type:'application/x-pnacl'};

    var myModule, transport, jsonRPC, runtime;

    beforeEach(function(){
      // make a new runtime mock
      runtimeMock = jasmine.createSpyObj("runtimeMock", [
        "handleCallback",
        "handleError",
        "handleRequest",
        "sendRequest",
        "sendCallback",
        "sendError"]);

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

    it("should only construct with a runtime", function(){
      expect(function(){
        new RPCStub();
      }).toThrow();

      expect(function(){
        new RPCStub(runtimeMock);
      }).not.toThrow();
    });



    it("should have methods to easily check types", function(){
      // because there are way too many cases to check, we only test a few working cases here.
      var p = RPCStub.prototype;
      expect(p.isInteger(12)).toBe(true);
      expect(p.isInteger(12.2)).toBe(false);

      expect(p.isFloat(12.2)).toBe(true); //we take approach float is superset of int
      expect(p.isFloat(12)).toBe(true);

      expect(p.isString("hello")).toBe(true);
      expect(p.isString(12)).toBe(false);

      expect(p.isChar("c")).toBe(true);
      expect(p.isChar("hi")).toBe(false);

      expect(p.isBoolean(true)).toBe(true);
      expect(p.isBoolean(false)).toBe(true);
      expect(p.isBoolean(1)).toBe(false);

      expect(p.isArrayBuffer(new ArrayBuffer(123))).toBe(true);
      expect(p.isArrayBuffer(12)).toBe(false);

      expect(p.isArray(['1'])).toBe(true);
      expect(p.isArray(12)).toBe(false);

    });



    it("should construct functions using a json notation", function(){
      var p = RPCStub.prototype;
      var fn = p.constructStub({
        "name"  : "foo",
        "params": ["String"],
        "returnType": "Boolean"
      });
      expect(fn instanceof Function).toBe(true);
    });



    it("should allow parameters of many types", function(){
      var p = RPCStub.prototype;
      var fn = p.constructStub({
        "name" : "foo",
        "params": ["String", "Integer", "Char", "Float", "Boolean", "Array", "Any", "ArrayBuffer", "Object",
          "IntegerArray", "StringArray", "CharArray", "FloatArray", "BooleanArray", "AnyArray"],
        "returnType": "Boolean"
      });
      expect(fn instanceof Function).toBe(true);
    });



    it("should construct functions that adhere to their 'stub spec'", function(){
      // when a function expects a boolean param and we give it a string, it should throw.
      var stub = new RPCStub(runtimeMock);
      var fn = stub.constructStub({
        "name"  : "myFunction",
        "params": ["Boolean"],
        "returnType": "Boolean"
      });

      expect(function(){
        fn("hello");
      }).toThrow();

      expect(function(){
        fn(true);
      }).not.toThrow();
    });

    it("should check the return value from a callback response", function(){
      // we will need an actual runtime.
      var stub = new RPCStub(runtime);

      // construct a function
      var myRPCFunction = stub.constructStub({
        "name" : "myRPCFunction",
        "params" : ["Boolean", "Integer"],
        "returnType" : "Boolean"
      });


      // do a request (call the function)
      var mySuccess = jasmine.createSpy("mySuccess"),
          myError = jasmine.createSpy("myError"),
          id = myRPCFunction(true, 124, mySuccess, myError);

      // fake the callback, with a correct return value. check no throw
      var messageSent = false;
      myModule.on("message", function(){
        messageSent = true;
      });

      myModule.moduleEl.fakeMessage({
        "jsonrpc": "2.0",
        "id" : id,
        "result" : true
      });

      waitsFor(function(){
        return messageSent;
      }, "message to be sent");

      runs(function(){
        expect(mySuccess).toHaveBeenCalledWith(true);
        expect(myError).not.toHaveBeenCalled();

        // do a new request
        messageSent=false;
        mySuccess = jasmine.createSpy("mySuccess");
        myError = jasmine.createSpy("myError");
        id = myRPCFunction(true, 124, mySuccess, myError);

        myModule.moduleEl.fakeMessage({
          "jsonrpc": "2.0",
          "id" : id,
          "result" : 124
        });

      });

      waitsFor(function(){
        return messageSent;
      }, "message to be sent");

      runs(function(){
        expect(mySuccess).not.toHaveBeenCalled();
        expect(myError).toHaveBeenCalled();
      });

    });

  });
});