define(["RPCStub", "RPCRuntime", "JSONRPC", "RPCTransport", "fakemodule", "NaClModule"], function(RPCStub, RPCRuntime, JSONRPC, RPCTransport, fakemodule, NaClModule){
  describe("RPC Stub", function() {
    var runtimeMock;
    var testModuleId = "rpcruntime-layer";
    var fakeAttrs = {src:'rpc-module.nmf', name:'myRPC', id:testModuleId, type:'application/x-pnacl'};

    var myModule, transport, jsonRPC, runtime;

    beforeEach(function(done){
      // make a new runtime mock
      runtimeMock = jasmine.createSpyObj("runtimeMock", [
        "handleCallback",
        "handleError",
        "handleRequest",
        "sendRequest",
        "sendCallback",
        "sendError"]);

      runtimeMock.getModule = jasmine.createSpy("getModule").and.callFake(function(){
        return myModule;
      });

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
      transport.load(function(){
        done();
      });
    });

    it("should only construct with a runtime", function(){
      expect(function(){
        new RPCStub();
      }).toThrow();

      expect(function(){
        new RPCStub(runtimeMock);
      }).not.toThrow();
    });


    it("should allow creating and getting interfaces by name", function(){
      var stub = new RPCStub(runtimeMock);
      stub.addInterface('MyInterface');

      var myInterface = stub.getInterface('MyInterface');

      // an interface is simply a map of functions
      expect(myInterface).toBeDefined();
    });


    it("should allow adding and getting functions to interfaces by name", function(){
      var p = new RPCStub(runtimeMock);
      var myInterface = p.addInterface('MyInterface'); //chainable

      myInterface.addFunction({
        "name": "foo",
        "params": [{"$ref": "unsigned long"}],
        "returnType": {"$ref": "boolean"}
      });

      // get the function back
      var fooFunction = myInterface.getFunction('foo');
      expect(fooFunction instanceof Function).toBe(true);
    });


    it("should allow adding interfaces with their functions by object", function(){
      var stub = new RPCStub(runtimeMock);
      var myInterface = stub.addInterface({
        "name": "MyInterface",
        "functions": [
          {
            "name": "foo",
            "params": [{"$ref": "unsigned long"}],
            "returnType": {"$ref": "boolean"}
          }
        ]
      });

      var fooFunction = myInterface.getFunction('foo');
      expect(fooFunction instanceof Function).toBe(true);

    });


    it("should not add an interface that already exists", function(){
      var stub = new RPCStub(runtimeMock);
      stub.addInterface("SameInterface"); //shouldn't throw.
      expect(function(){
        stub.addInterface("SameInterface"); // should throw.
      }).toThrow();
    });


    it("should not add a function to an interface that already has that function name", function(){
      var stub = new RPCStub(runtimeMock);
      var myInterface = stub.addInterface("MyInterface").addFunction({
        "name": "foo",
        "params": [],
        "returnType": "void"
      });

      expect(function(){
        myInterface.addFunction({
          "name": "foo",
          "params": [],
          "returnType": "void"
        });
      }).toThrow();
    });



    it("should construct functions using string types", function(){
      var stub = new RPCStub(runtimeMock);
      var MyInterface = stub.addInterface("MyInterface").addFunction({
        "name": "foo",
        "params": ["unsigned long"],
        "returnType": "boolean"
      });
      expect(MyInterface.getFunction("foo") instanceof Function).toBe(true);
    });



    it("should allow specifying array types", function(){
      var stub = new RPCStub(runtimeMock);
      var MyInterface = stub.addInterface("MyInterface").addFunction({
        "name": "foo",
        "params": [{"type": "array", "items": {"$ref": "unsigned long"}}],
        "returnType": "boolean"
      });
      expect(MyInterface.getFunction("foo") instanceof Function).toBe(true);
    });


    it("should allow adding dictionary definitions using json schema notation", function(){
      var stub = new RPCStub(runtimeMock);
      stub.addDictionary({
        "name": "Person",
        "required": ["name", "age"],
        "properties": {
          "name": {"$ref": "DOMString"},
          "age": {"$ref": "unsigned long"}
        }
      });

      expect(stub.getDictionary("Person")).toBeDefined();
    });

    it("should allow adding dictionaries that reference other dictionaries.", function(){
      var stub = new RPCStub(runtimeMock);
      stub.addDictionary({
        "name": "Person",
        "required": ["name", "age"],
        "properties": {
          "name": {"$ref": "DOMString"},
          "age": {"$ref": "unsigned short"}
        }

      });

      stub.addDictionary({
        "name": "PersonID",
        "required": ["person", "id"],
        "properties": {
          "person": {"$ref": "Person"},
          "id": {"$ref": "unsigned long"}
        }
      });

      expect(stub.getDictionary("PersonID")).toBeDefined();
    });


    it("should construct functions that adhere to their definitions", function(){
      var stub = new RPCStub(runtimeMock);

      // the most complex thing: an array of dictionaries, with some binary thrown in the mix :D
      stub.addDictionary({
        "name": "Person",
        "required": ["name", "age"],
        "properties": {
          "name": {"$ref": "DOMString"},
          "age": {"$ref": "unsigned short"}
        }

      });

      stub.addDictionary({
        "name": "PersonID",
        "required": ["person", "id"],
        "properties": {
          "person": {"$ref": "Person"},
          "id": {"$ref": "unsigned long"}
        }
      });

      stub.addInterface({
        "name": "MyInterface",
        "functions": [
          {
            "name": "printPeople",
            "params": [
              { /* Param 1: an array of PersonID dicts */
                "type": "array",
                "items": {"$ref": "PersonID"}
              }, {
                /* Param 2: an IDL type */
                "$ref": "unsigned long"
              }, {
                /* Param 3: Some binary thrown in */
                "binary": true
              }
            ],
            "returnType": "void"
          }
        ]
      });


      var printPeople = stub.getInterface("MyInterface").getFunction("printPeople");

      // working cases
      printPeople([{"id": 12, "person": {"name": "Mohamed", "age": 2}}], 23, new ArrayBuffer(10));
      printPeople([{"id": 12, "person": {"name": "Mohamed", "age": 2}}], 23, new Float32Array(12).buffer, function(){});
      printPeople([{"id": 12, "person": {"name": "Mohamed", "age": 2}}], 23, new Int32Array(10).buffer, function(){}, function(){});


      // failing cases
      // 2nd param incorrect
      expect(function(){
        printPeople([{"id": 12, "person": {"name": "Mohamed", "age": 2}}], "not a number", new ArrayBuffer(10));
      }).toThrow();

      // age incorrect
      expect(function(){
        printPeople([{"id": 12, "person": {"name": "Mohamed", "age": "not a number"}}], 23, new ArrayBuffer(10));
      }).toThrow();

      // 3rd param incorrect
      expect(function(){
        printPeople([{"id": 12, "person": {"name": "Mohamed", "age": 2}}], 23, 123);
      }).toThrow();

      expect(runtimeMock.sendRequest.calls.count()).toEqual(3);
    });

    it("should check the return value from a callback response", function(){
      var stub = new RPCStub(runtimeMock);

      // the most complex thing: an array of dictionaries
      stub.addDictionary({
        "name": "Person",
        "required": ["name", "age"],
        "properties": {
          "name": {"$ref": "DOMString"},
          "age": {"$ref": "unsigned short"}
        }

      });

      stub.addDictionary({
        "name": "PersonID",
        "required": ["person", "id"],
        "properties": {
          "person": {"$ref": "Person"},
          "id": {"$ref": "unsigned long"}
        }
      });

      stub.addInterface({
        "name": "MyInterface",
        "functions": [
          {
            "name": "getPeople",
            "params": [
              {"$ref" : "unsigned short"}
            ],
            "returnType": {"type":"array", "items": {"$ref": "PersonID"}}
          }
        ]
      });



      var successCallback, errorCallback;
      var responseData;
      runtimeMock.sendRequest = jasmine.createSpy("sendRequest").and.callFake(function(name, params, successCB, errorCB){
        // sending a request simply calls the callback function.
        successCB.call(null, responseData);
      });

      var getPeople = stub.getInterface("MyInterface").getFunction("getPeople");

      // get people takes an unsigned short and returns an array of PeopleID's

      // working case
      responseData = [
        {"id": 1, "person": {"name": "Mohamed", "age": 12}},
        {"id": 2, "person": {"name": "James", "age": 12}}
      ];
      getPeople(10, successCallback = jasmine.createSpy("callback1"), errorCallback = jasmine.createSpy("eCallback1"));
      expect(successCallback).toHaveBeenCalledWith(responseData);
      expect(errorCallback).not.toHaveBeenCalled();

      // failing cases
      responseData = [
        {"id": 1, "person": {"name": "Mohamed", "age": 12}},
        {"id": 2, "person": {"name": 500, "age": 12}} // name is supposed to be DOMString
      ];
      successCallback = jasmine.createSpy("callback2");
      errorCallback = jasmine.createSpy("eCallback1").and.callFake(function(data){
        // the error should have the data
        expect(data.data).toBe(responseData);
      });

      getPeople(10, successCallback, errorCallback);
      expect(successCallback).not.toHaveBeenCalled();
      expect(errorCallback).toHaveBeenCalled();

    });


    it("should export the NaCl Module", function(){
      var stub = new RPCStub(runtimeMock);
      var naclmodule = stub.getModule();
      expect(naclmodule instanceof NaClModule).toBe(true);
    });

  });
});