define(['RPCModule', 'NaClModule'], function(RPCModule, NaClModule){
  return new RPCModule({
    'module': new NaClModule({name:'Logger'}),
    'functions': [
      {'name': 'helloName', 'params': ['DOMString'], 'returnType': 'DOMString'},
      {'name': 'greetName', 'params': ['DOMString', 'DOMString'], 'returnType': 'DOMString'}
    ]
  });
});
