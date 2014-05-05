// This file was actually generated! :O
define(['RPCModule', 'NaClModule'], function(RPCModule, NaClModule){
  return function(srcPrefix){
    srcPrefix=srcPrefix?srcPrefix:'';
    return new RPCModule({
      "module": new NaClModule({name:"Fib", srcPrefix: srcPrefix}),
      "interfaces": [
        {
          "name": "Fib",
          "functions": [
            {
              "name": "fib",
              "params": [{"$ref":"unsigned long"}],
              "returnType": {"$ref":"long"}
            },
            {
              "name": "countUp",
              "params": [],
              "returnType": {"$ref":"long"}
            }
          ]
        }
      ],

      "dictionaries": [
      ]
    });
  };
});