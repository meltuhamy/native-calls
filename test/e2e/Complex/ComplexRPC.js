define(['RPCModule', 'NaClModule'], function(RPCModule, NaClModule){
  return function(srcPrefix){
    srcPrefix=srcPrefix?srcPrefix:'';
    return new RPCModule({
      "module": new NaClModule({name:"Complex", srcPrefix: srcPrefix}),
      "interfaces": [
        {
          "name": "Calculator",
          "functions": [
            {
              "name": "add",
              "params": [{"$ref":"complex_double"},{"$ref":"complex_double"}],
              "returnType": {"$ref":"complex_double"}
            },
            {
              "name": "subtract",
              "params": [{"$ref":"complex_double"},{"$ref":"complex_double"}],
              "returnType": {"$ref":"complex_double"}
            },
            {
              "name": "multiply",
              "params": [{"$ref":"complex_double"},{"$ref":"complex_double"}],
              "returnType": {"$ref":"complex_double"}
            },
            {
              "name": "sum_all",
              "params": [{"type":"array","items":{"$ref":"complex_double"}}],
              "returnType": {"$ref":"complex_double"}
            },
            {
              "name": "multiply_all",
              "params": [{"type":"array","items":{"$ref":"complex_double"}}],
              "returnType": {"$ref":"complex_double"}
            }
          ]
        }
      ],

      "dictionaries": [
        {
          "name": "complex_double",
          "required": ["real","imaginary"],
          "properties": {"real":{"$ref":"double"},"imaginary":{"$ref":"double"}}
        }
      ]
    });
  };
});
