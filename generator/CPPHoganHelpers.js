var _ = require("lodash");


var STDIDLTypeMap = module.exports.STDIDLTypeMap = {
  "DOMString": "std::string",
  "boolean" : "bool",
  "byte" : "int8_t",
  "octet" : "uint8_t",
  "short" : "int16_t",
  "unsigned short" : "uint16_t",
  "long" : "int32_t",
  "unsigned long" : "uint32_t",
  "long long" : "int64_t",
  "unsigned long long" : "uint64_t",
  "float" : "float",
  "double" : "double"
};

module.exports.getContext = function(ast, moduleName){
  var context =  {
    moduleName: moduleName,

    timestamp: ""+(new Date()),

    dictionaries: ast.getDictionaryArray(),

    interfaces: ast.getInterfaceArray(),

    hasDictTypes: function(){
      return this.dictionaries.length > 0;
    },

    typeIsSequence: function(){
      return this.idlType && this.idlType.sequence;
    },

    typeIsArray: function(){
      return this.idlType && this.idlType.array > 0;
    },

    STDTypeName: function(){
      var typeName = ast.getTypeName(this);
      if(ast.isDictionaryType(typeName)){
        // it's a dictionary, we don't need formatting.
        return typeName;
      } else if(ast.isPrimitiveType(typeName)){
        if(STDIDLTypeMap[typeName]){
          return STDIDLTypeMap[typeName];
        } else {
          // assume the idl primitive type is supported in std c++!
          return typeName;
        }
      } else {
        // it's something else.
        throw "Type case not handled: "+typeName;
      }
    },

    TypeWrapperName: function(){
      var typeName = ast.getTypeName(this);
      if(ast.isDictionaryType(typeName)){
        // it's a dictionary, we don't need formatting.
        return typeName;
      } else if(ast.isPrimitiveType(typeName)){
        // CamelCase it
        return typeName.replace(/(?:^\w|[A-Z]|\b\w)/g, function (l) {
          return l.toUpperCase();
        }).replace(/\s+/g, '');
      } else {
        // it's something else.
        throw "Type case not handled: "+typeName;
      }
    },

    ThrowsRPCErrorParamTypeString: function(){
      // pre: context: this is an operation
      var typeName = "pprpc::RPCError&";
      if(this.ThrowsRPCError){
        // it does indeed throw.
        if(this.arguments.length == 0){
          // there werent any previous arguments.
          return typeName;
        } else {
          // there were previous arguments
          return ", "+typeName;
        }
      }
    },

    ThrowsRPCErrorParamString: function(){
      // pre: context: this is an operation
      var typeName = "error";
      if(this.ThrowsRPCError){
        // it does indeed throw.
        if(this.arguments.length == 0){
          // there werent any previous arguments.
          return typeName;
        } else {
          // there were previous arguments
          return ", "+typeName;
        }
      }
    }


  };

  return _.assign(context, {
    // functions that depend on previous functions.

    STDTypeString: function(){
      var stdTypeName = context.STDTypeName.apply(this);
      if(context.typeIsSequence.apply(this)){
        return "std::vector<"+stdTypeName+">";
      } else if(context.typeIsArray.apply(this)){
        return stdTypeName+"*";
      } else {
        // normal
        return stdTypeName;
      }
    }
  });
};
