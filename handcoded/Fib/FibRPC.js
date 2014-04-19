define(['RPCModule', 'NaClModule'], function(RPCModule, NaClModule){
  return new RPCModule({
    'module': new NaClModule({name:'Fib'}),
    'functions': [
      {'name': 'fib', 'params': ['long'], 'returnType': 'long'}
    ]
  });
});

