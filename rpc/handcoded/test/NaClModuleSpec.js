define(["NaClModule"], function(NaClModule){

  describe("NaCl RPC Module", function() {

    afterEach(function() {
      // remove the naclmodule after each test.
      listenerElement = document.getElementById('rpcModule-listener');
      if(listenerElement){
        listenerElement.parentNode.removeChild(listenerElement);
      }
    });


    it("should construct",function(){
      myModule = new NaClModule({src:'rpc-module.nmf', name:'rpc', id:'rpcModule', type:'application/x-pnacl'});
      expect(myModule).toBeDefined();
    });


    it("should fail to construct if we don't give it src, name, id or type", function(){
      var nonGiven = function(){ new NaClModule(); };
      var nonGiven2 = function(){ new NaClModule({}); };
      var rpcmodulegiven = function(){ new NaClModule({src:'rpc-module.nmf'}); };
      var rpcmoduleAndName = function(){ new NaClModule({src:'rpc-module.nmf', name:'rpc1'}); };
      var rpcmoduleNameAndId = function(){ new NaClModule({src:'rpc-module.nmf', name:'rpc2', id:'rpcModule'}); };
      var rpcmoduleNameAndIdType = function(){ new NaClModule({src:'rpc-module.nmf', name:'rpc3', id:'rpcModule',type:'application/x-pnacl'}); };

      expect(nonGiven).toThrow();
      expect(nonGiven2).toThrow();
      expect(rpcmodulegiven).toThrow();
      expect(rpcmoduleAndName).toThrow();
      expect(rpcmoduleNameAndId).toThrow();

      // the only one that works is when they're all filled in.
      expect(rpcmoduleNameAndIdType).not.toThrow();

    });


    it("should fail to construct if the application type isn't valid", function(){
      // not working
      var notCorrectType = function(){ new NaClModule({src:'rpc-module.nmf', name:'rpc', id:'rpcModule',type:'application/x-helloworld'}); };
      expect(notCorrectType).toThrow();
    });


    it("should construct with x-nacl types", function(){
      var rpcmoduleNameAndIdType = function(){ new NaClModule({src:'rpc-module.nmf', name:'rpc', id:'rpcModule',type:'application/x-nacl'}); };
    });


    it("should construct with x-pnacl types", function(){
      var rpcmoduleNameAndIdType = function(){ new NaClModule({src:'rpc-module.nmf', name:'rpc', id:'rpcModule',type:'application/x-pnacl'}); };
    });

  });
});