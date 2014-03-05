define(["common"], function(common){
  describe("NaCl RPC Module", function() {
    var naclModule;

    beforeEach(function() {
      // set up the module before testing it.
      body = document.getElementsByTagName('body')[0];
      listenerDiv = document.createElement('div');
      listenerDiv.setAttribute('id','listener');
      body.appendChild(listenerDiv);
      common.createNaClModule("rpc-module",'pnacl','base/src',1,1);

      waitsFor(function() {
        return common.naclModule != null;
      }, "the nacl module must load", 10000);

      runs(function(){
        naclModule = common.naclModule;
      });

    });

    it("should load the naclModule", function() {
      expect(naclModule).not.toBeFalsy();
    });

    // add some tests here, knowing the naclModule has loaded properly.

  });
});