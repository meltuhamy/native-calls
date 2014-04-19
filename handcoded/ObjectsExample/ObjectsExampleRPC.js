define(['RPCModule', 'NaClModule'], function(RPCModule, NaClModule){
  return new RPCModule({
    'module': new NaClModule({name:'ObjectsExample'}),
    'functions': [
      {'name': 'acceptsObject', 'params': ['object'], 'returnType': 'long'},
      {'name': 'acceptsTypedArray', 'params': ['object'], 'returnType': 'long'}
    ]
  });
});

