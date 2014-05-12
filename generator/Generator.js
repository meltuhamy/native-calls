var fs = require('fs');
var hogan = require('hogan.js');
var _ = require('lodash');

function getTemplate(templateSrc){
  return fs.readFileSync(templateSrc, {encoding: 'utf8'});
}

function getJSTemplate(templateName){
  return getTemplate(__dirname+"/js-templates/"+templateName+".mustache");
}

function getCPPTemplate(templateName){
  return getTemplate(__dirname+"/cpp-templates/"+templateName+".mustache");

}

module.exports.genJSString = function(ast, moduleName){
  var dictionaries = ast.getDictionaryArray() || [];
  var interfaces = ast.getInterfaceArray() || [];

  if(dictionaries.length > 0) dictionaries[dictionaries.length-1].end = true;
  if(interfaces.length > 0) interfaces[interfaces.length-1].end = true;

  // need to fix commas with operations :/
  for(var i = 0; i < interfaces.length; i++){
    var operations = interfaces[i].operations;
    if(operations.length > 0){
      operations[operations.length-1].endOps = true;
    }
  }

  return hogan.compile(getJSTemplate('rpcmodule')).render({
    name: moduleName ? moduleName : "JSRPCModule",
    timestamp: ""+(new Date()),
    interfaces: ast.getInterfaceArray(),
    dictionaries: ast.getDictionaryArray(),
    schemaTypeString: function(){
      return JSON.stringify(this.schemaType);
    },

    argumentsArrayString: function(){
      return JSON.stringify((this.arguments ? this.arguments : []).map(function(a){return a.schemaType}));
    },

    dictRequired: function(){
      // todo: actual required checks (PropName? syntax in idl)
      return JSON.stringify(this.members.map(function(m){return m.name}));
    },

    dictProperties: function(){
      var out = {};
      var members = this.members ? this.members : [];
      for(var i = 0; i < members.length; i++){
        out[members[i].name] = members[i].schemaType;
      }
      return JSON.stringify(out);
    }

  });
};



/*
C++ Code generation
 */


var STDIDLTypeMap = {
  "DOMString": "std::string",
  "boolean" : "bool"
};

var getHoganHelpers = function(ast, moduleName){
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


  };

  return _.assign(context, {
    CPPTypeString: function(){
      return context.STDTypeName.apply(this);
    }
  });
};




module.exports.genCPPString = function(ast, moduleName){

  var context = _.assign(getHoganHelpers(ast, moduleName), {
    numParams: function(){
      return (this.arguments ? this.arguments : []).length;
    }
  });

  return hogan.compile(getCPPTemplate('cppmodule')).render(context);
};


module.exports.genInterfaceString = function(ast, interfaceName, moduleName){
  if(!ast.interfaces[interfaceName]){
    throw "Could not find interface "+interfaceName;
  }

  var context = _.assign(getHoganHelpers(ast, moduleName), _.assign(ast.interfaces[interfaceName], {
    includeDefName: interfaceName.toUpperCase()
  }));

  return hogan.compile(getCPPTemplate("interface")).render(context);

};


module.exports.genDictionaryTypesString = function(ast, moduleName){
  var context = getHoganHelpers(ast, moduleName);
  return hogan.compile(getCPPTemplate("types")).render(context);
};

module.exports.genMakefileString = function(ast, moduleName){
  return hogan.compile(getCPPTemplate("Makefile")).render({
    moduleName: moduleName,
    timestamp: ""+(new Date()),
    interfaces: ast.getInterfaceArray()
  });
};


