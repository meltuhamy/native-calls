describe("NaCl Module", function() {
  it("should load nacl", function(){
    body = document.getElementsByTagName('body')[0];
    listenerDiv = document.createElement('div');
    listenerDiv.setAttribute('id','listener');
    body.appendChild(listenerDiv);
    common.createNaClModule("rpc-module",'pnacl','base/src',1,1);

    waitsFor(function() {
      return common.naclModule != null;
    }, "the nacl module must load", 10000);
  });
});