define(['RPCModule', 'NaClModule'], function(RPCModule, NaClModule){
  return new RPCModule({
    "module": new NaClModule({name:"Fib"}),
    "interfaces": [
      {
        "name": "Fib",
        "functions": [
          {
            "name": "fib",
            "params": [{"$ref": "unsigned long"}],
            "returnType": {"$ref": "unsigned long"}
          },
          {
            "name": "countUp",
            "params": [],
            "returnType": {"$ref": "long"}
          }
        ]
      }
    ],
    "dictionaries": []
  });
});

