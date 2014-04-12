define(['RPCModule', 'NaClModule'], function(RPCModule, NaClModule){
  return new RPCModule({
    'module': new NaClModule({src:'ObjectsExample/ObjectsExample.nmf', name:'ObjectsExample', id:'ObjectsExample', type:'application/x-pnacl'}),
    'functions': [
      {'name': 'acceptsObject', 'params': ['object'], 'returnType': 'long'},
      {'name': 'acceptsTypedArray', 'params': ['object'], 'returnType': 'long'}
    ]
  });
});

