// Later, the generator will generate something like this using the IDL file.
define(['RPCModule', 'NaClModule'], function(RPCModule, NaClModule){
  return new RPCModule({
    "module": new NaClModule({src:'../rpc-module.nmf', name:'myRPC', id:"naclRPC", type:'application/x-pnacl'}),
    "functions": [
      {"name": "Echo", "params": ["String"], "returnType": "String"}
    ]
  });
});
