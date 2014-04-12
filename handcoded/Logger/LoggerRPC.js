define(['RPCModule', 'NaClModule'], function(RPCModule, NaClModule){
  return new RPCModule({
    'module': new NaClModule({src:'Logger/Logger.nmf', name:'Logger', id:'Logger', type:'application/x-pnacl'}),
    'functions': [
      {'name': 'helloName', 'params': ['DOMString'], 'returnType': 'DOMString'},
      {'name': 'greetName', 'params': ['DOMString', 'DOMString'], 'returnType': 'DOMString'}
    ]
  });
});
