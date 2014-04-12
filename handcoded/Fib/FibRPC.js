define(['RPCModule', 'NaClModule'], function(RPCModule, NaClModule){
  return new RPCModule({
    'module': new NaClModule({src:'Fib/Fib.nmf', name:'Fib', id:'Fib', type:'application/x-pnacl'}),
    'functions': [
      {'name': 'fib', 'params': ['long'], 'returnType': 'long'}
    ]
  });
});

