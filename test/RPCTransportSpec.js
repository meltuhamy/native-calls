define(["RPCTransport", "NaClModule", "fakemodule"], function(RPCTransport, NaClModule, fakemodule){
  describe("RPC Transport", function() {
    var testModuleId = "rpc-transport";
    var fakeAttrs = {src:'rpc-module.nmf', name:'myRPC', id:testModuleId, type:'application/x-pnacl'};

    beforeEach(function() {
      // remove the naclmodule after each test.
      var listenerElement = document.getElementById(testModuleId+'-listener');
      if(listenerElement){
        listenerElement.parentNode.removeChild(listenerElement);
      }
    });



    it("should construct", function(){
      var transport = new RPCTransport(new NaClModule({src:'rpc-module.nmf', name:'myRPC', id:testModuleId, type:'application/x-pnacl'}));
      expect(transport).toBeDefined();
    });



    it("should fail to construct without a module", function(){
      expect(function(){ new RPCTransport(); }).toThrow();
    });



    it("should load the naclmodule", function(done){
      var myModule = fakemodule.createModuleWithFakeEmbed(new NaClModule(fakeAttrs));
      var transport = new RPCTransport(myModule);

      transport.load(function(){
        expect(myModule.status).toBe(1);
        done();
      });
    });



    it("should send messages to the (loaded) module using postMessage", function(done){
      var myModule = fakemodule.createModuleWithFakeEmbed(new NaClModule(fakeAttrs));
      var transport = new RPCTransport(myModule);

      transport.load(function(){
        spyOn(myModule,"postMessage");
        transport.send("hello world");
        expect(myModule.postMessage).toHaveBeenCalled();
        done();
      });
    });



    it("should load the module if postMessage was called and it isn't loaded", function(done){
      var myModule = fakemodule.createModuleWithFakeEmbed(new NaClModule(fakeAttrs));
      var transport = new RPCTransport(myModule);

      expect(myModule.status).not.toBe(1); //1 means loaded
      spyOn(myModule, "load").and.callThrough();
      spyOn(myModule, "postMessage").and.callFake(done);

      transport.send("hello world");
      expect(myModule.load).toHaveBeenCalled();
    });



    it("should construct with a json-rpc layer", function(){
      var myModule = fakemodule.createModuleWithFakeEmbed(new NaClModule(fakeAttrs));
      var jsonRPC = jasmine.createSpyObj("jsonRPC", ["checkRPCCallback"]);
      new RPCTransport(myModule, jsonRPC);
    });


    it("should allow setting the json-rpc layer at runtime", function(){
      var myModule = fakemodule.createModuleWithFakeEmbed(new NaClModule(fakeAttrs));
      var jsonRPC = jasmine.createSpyObj("jsonRPC", ["checkRPCCallback"]);
      var transport = new RPCTransport(myModule);
      transport.setJSONRPC(jsonRPC);
    });



    it("should handle messages coming from the module", function(done){
      var myModule = fakemodule.createModuleWithFakeEmbed(new NaClModule(fakeAttrs));

      spyOn(RPCTransport.prototype, "handleMessage");
      var transport = new RPCTransport(myModule);

      // load and fake a message
      myModule.load(function(){
        myModule.moduleEl.fakeMessage("Hello World", function(){
          expect(transport.handleMessage).toHaveBeenCalled();
          done();
        });
      });

    });



    it("should pass messages on to the json-rpc layer if constructed with one", function(done){
      var myModule = fakemodule.createModuleWithFakeEmbed(new NaClModule(fakeAttrs));

      // We mock the JSON RPC
      var jsonRPC = jasmine.createSpyObj("jsonRPC", ["handleRPC"]);
      var transport = new RPCTransport(myModule, jsonRPC);

      // load and fake a message
      myModule.load(function(){
        myModule.moduleEl.fakeMessage("Hello World", function(){
          expect(jsonRPC.handleRPC).toHaveBeenCalled();
          done();
        });
      });
    });


    it("should export the NaCl Module", function(){
      var myModule = fakemodule.createModuleWithFakeEmbed(new NaClModule(fakeAttrs));

      // We mock the JSON RPC
      var jsonRPC = jasmine.createSpyObj("jsonRPC", ["handleRPC"]);
      var transport = new RPCTransport(myModule, jsonRPC);

      var exportedModule = transport.getModule();
      expect(exportedModule instanceof NaClModule).toBe(true);

    });



  });
});