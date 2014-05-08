var fs = require('fs');
var hogan = require('hogan.js');

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


module.exports.genCPPString = function(ast, moduleName){
  var dictionaries = ast.getDictionaryArray();
  return hogan.compile(getCPPTemplate('cppmodule')).render({
    moduleName: moduleName ? moduleName : "CPPRPCModule",
    timestamp: ""+(new Date()),
    interfaces: ast.getInterfaceArray(),
    dictionaries: dictionaries,
    IDLTypeName: function(){
      var typeName = ast.getTypeName(this);
      if(ast.isDictionaryType(typeName)){
        return typeName;
      } else if(ast.isPrimitiveType(typeName)){
        // CamelCased version of primitive type. eg. unsigned long long => UnsignedLongLong
        return typeName.replace(/(?:^\w|[A-Z]|\b\w)/g,function(l){return l.toUpperCase();}).replace(/\s+/g,'');
      }
    },
    argumentIsArray: function(){
      return this.idlType && this.idlType.array > 0;
    },
    numParams: function(){
      return (this.arguments ? this.arguments : []).length;
    },
    isDictTypes: function(){
      return dictionaries.length > 0;
    }
  });
};


module.exports.genInterfaceString = function(ast, interfaceName, moduleName){
  if(ast.interfaces[interfaceName]){
    var renderContext = ast.interfaces[interfaceName];
    renderContext.moduleName = moduleName;
    renderContext.includeDefName = interfaceName.toUpperCase();
    renderContext.cppIDLName = function(){ return ast.getTypeName(this); };
    renderContext.typeIsArray = function(){ return this.idlType && this.idlType.array > 0; };
    renderContext.timestamp = ""+(new Date());
    renderContext.isDictTypes = function(){ return ast.getDictionaryArray().length > 0 };
    return hogan.compile(getCPPTemplate("interface")).render(renderContext);
  } else {
    throw "Could not find interface "+interfaceName;
  }
};


module.exports.genDictionaryTypesString = function(ast, moduleName){
  return hogan.compile(getCPPTemplate("types")).render({
    dictionaries: ast.getDictionaryArray(),
    moduleName: moduleName,
    timestamp: ""+(new Date()),
    includeDefName: moduleName.toUpperCase(),
    typeIsArray: function(){ return this.idlType && this.idlType.array > 0; },
    cppIDLName: function(){ return ast.getTypeName(this); }
  });
};

module.exports.genMakefileString = function(ast, moduleName){
  return hogan.compile(getCPPTemplate("makefile")).render({
    moduleName: moduleName,
    timestamp: ""+(new Date()),
    interfaces: ast.getInterfaceArray()
  });
};


