var _ = require("lodash");


var STDIDLTypeMap = module.exports.STDIDLTypeMap = {
  "DOMString": "std::string",
  "boolean" : "bool"
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
    }


  };

  return _.assign(context, {
    // functions that depend on previous functions.
    CPPTypeString: function(){
      return context.STDTypeName.apply(this);
    }
  });
};
