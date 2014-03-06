define(["NaClModule"], function(NaClModule){

  describe("NaCl Module", function() {
    var testModuleId = "rpc-module";

    afterEach(function() {
      // remove the naclmodule after each test.
      listenerElement = document.getElementById(testModuleId+'-listener');
      if(listenerElement){
        listenerElement.parentNode.removeChild(listenerElement);
      }
    });


    it("should construct",function(){
      myModule = new NaClModule({src:'rpc-module.nmf', name:'rpc', id:testModuleId, type:'application/x-pnacl'});
      expect(myModule).toBeDefined();
    });


    it("should fail to construct if we don't give it src, name, id or type", function(){
      var nonGiven = function(){ new NaClModule(); };
      var nonGiven2 = function(){ new NaClModule({}); };
      var rpcmodulegiven = function(){ new NaClModule({src:'rpc-module.nmf'}); };
      var rpcmoduleAndName = function(){ new NaClModule({src:'rpc-module.nmf', name:'rpc1'}); };
      var rpcmoduleNameAndId = function(){ new NaClModule({src:'rpc-module.nmf', name:'rpc2', id:testModuleId}); };
      var rpcmoduleNameAndIdType = function(){ new NaClModule({src:'rpc-module.nmf', name:'rpc3', id:testModuleId,type:'application/x-pnacl'}); };

      expect(nonGiven).toThrow();
      expect(nonGiven2).toThrow();
      expect(rpcmodulegiven).toThrow();
      expect(rpcmoduleAndName).toThrow();
      expect(rpcmoduleNameAndId).toThrow();

      // the only one that works is when they're all filled in.
      expect(rpcmoduleNameAndIdType).not.toThrow();

    });


    it("should fail to construct if the application type isn't valid", function(){
      var notCorrectType = function(){ new NaClModule({src:'rpc-module.nmf', name:'rpc', id:testModuleId,type:'application/x-helloworld'}); };
      expect(notCorrectType).toThrow();
    });


    it("should construct with x-nacl types", function(){
      new NaClModule({src:'rpc-module.nmf', name:'rpc', id:testModuleId,type:'application/x-nacl'});
    });


    it("should construct with x-pnacl types", function(){
      new NaClModule({src:'rpc-module.nmf', name:'rpc', id:testModuleId,type:'application/x-pnacl'});
    });


    it("should fail when a module with the same name already exists", function(){
      var rpcmoduleNameAndIdType = function(){ new NaClModule({src:'rpc-module.nmf', name:'rpc', id:testModuleId,type:'application/x-pnacl'}); };
      // first time should pass
      expect(rpcmoduleNameAndIdType).not.toThrow();

      // second time should fail.
      expect(rpcmoduleNameAndIdType).toThrow();
    });


    it("should load a module and call a callback we specify", function(){
      var myModule = new NaClModule({src:'rpc-module.nmf', name:'rpc', id:testModuleId,type:'application/x-pnacl'}),
          fakeEmbed = document.createElement("embed"),
          originalEmbed = myModule.moduleEl,
          listener = myModule.listenerDiv;


      myModule.moduleEl = fakeEmbed;

      // we haven't called .load() yet, so the status should be 0.
      expect(myModule.status).toBe(0); // 0 means NO-STATUS

      // we create a callback spy to ensure the callback is called
      var loadCallbackSpy = jasmine.createSpy("loadCallback");

      // idea: load the module and the fakeEmbed will fire the load event.
      myModule.load(loadCallbackSpy);


      var loaded = false;
      setTimeout(function(){
        // fake the load event
        fakeEmbed.readyState = 1;
        fakeEmbed.dispatchEvent(new CustomEvent('loadstart'));
        fakeEmbed.readyState = 4;
        fakeEmbed.dispatchEvent(new CustomEvent('load'));
        fakeEmbed.dispatchEvent(new CustomEvent('loadend'));
        loaded = true;
      }, 50);

      // wait for the module to load
      waitsFor(function(){
        return loaded;
      }, "the embed should eventually load", 1000);

      // check callback was called and status changed
      runs(function(){
        expect(loadCallbackSpy).toHaveBeenCalled();
        expect(myModule.status).toBe(1); // 1 means loaded
      });
    });

  });
});