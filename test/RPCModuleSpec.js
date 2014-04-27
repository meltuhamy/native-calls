define(["RPCModule", "NaClModule", "fakemodule"], function(RPCModule, NaClModule, fakemodule){
  describe("RPC Module", function() {
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


    it("should export interfaces", function(){
      var MyRPCModule = new RPCModule({
        module: myModule,
        interfaces: [
          {"name": "MyInterface", "functions": []},
          {"name": "SecondInterface", "functions": []}
        ],
        dictionaries: []
      });

      expect(MyRPCModule.MyInterface).toBeDefined();
      expect(MyRPCModule.SecondInterface).toBeDefined();

      // not allowed to have any other enumerable properties
      var allowed = ["MyInterface", "SecondInterface"];
      for(var key in MyRPCModule){
        expect(allowed.indexOf(key)).toBeGreaterThan(-1);
      }
    });


    it("should export functions in the interfaces", function(){
      var MyRPCModule = new RPCModule({
        module: myModule,
        interfaces: [
          {
            "name": "MyInterface",
            "functions": [
              {"name": "firstFn", "params": []},
              {"name": "secondFn", "params": []}
            ]
          },
          {"name": "SecondInterface"}
        ],
        dictionaries: []
      });

      expect(MyRPCModule.MyInterface.firstFn instanceof Function).toBe(true);
      expect(MyRPCModule.MyInterface.secondFn instanceof Function).toBe(true);

      //MyInterface should have ONLY these enumerable properties:
      var myInterfaceAllowed = ["firstFn", "secondFn"];
      for(var key in MyRPCModule.MyInterface){
        expect(myInterfaceAllowed.indexOf(key)).toBeGreaterThan(-1);
      }

      for(key in MyRPCModule.SecondInterface){
        // should never get here
        expect(key).toBeUndefined();
      }


    });


    it("should export functions that make real rpc calls", function(done){
      var validPersonDatabase = [
        {"id": 1, "person": {"name": "Mohamed", "age": 12}},
        {"id": 2, "person": {"name": "James", "age": 12}}
      ];


      var MyRPCModule = new RPCModule({
        module: myModule,
        interfaces: [
          {
            "name": "MyInterface",
            "functions": [
              {
                "name": "printPeople",
                "params": [
                  {"type": "array", "items": {"$ref": "PersonID"}},
                  {"$ref": "DOMString"}
                ],
                "returnType": {"$ref": "unsigned long"}
              }
            ]
          },
          {"name": "SecondInterface"}
        ],
        dictionaries: [
          {
            name: 'Person',
            required:["name", "age"],
            properties: {
              "name": {"$ref": 'DOMString'},
              "age": {"$ref": 'unsigned short'}
            }
          },
          {
            'name': 'PersonID',
            required: ["person", "id"],
            properties: {
              "person": {"$ref": "Person"},
              "id": {"$ref": "unsigned long"}
            }
          }
        ]
      });


      // when a request is made, send back a response.
      var requestID;
      spyOn(myModule.moduleEl, "postMessage").and.callFake(function(){
        myModule.moduleEl.fakeMessage({
          "jsonrpc": "2.0",
          "id": requestID,
          "result": 234 // 234 is just an unsigned long..
        });
      });

      requestID = MyRPCModule.MyInterface.printPeople(validPersonDatabase, "Hello", function(data){
        expect(data).toBe(234);
        done();
      });

    });


    it("should export the stub layer object", function(){
      var MyRPCModule = new RPCModule({
        module: myModule,
        interfaces: [],
        dictionaries: []
      });

      var stub = RPCModule.getStub(MyRPCModule);
      expect(stub).toBeDefined();
    });

    it("should export the nacl module", function(){
      var MyRPCModule = new RPCModule({
        module: myModule,
        interfaces: [],
        dictionaries: []
      });

      var naclModule = RPCModule.getModule(MyRPCModule);
      expect(naclModule instanceof NaClModule).toBe(true);
    });

  });
});