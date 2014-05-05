var fs = require('fs');
var hogan = require('hogan.js');

function getTemplate(templateSrc){
  return fs.readFileSync(templateSrc, {encoding: 'utf8'});
}

function getJSTemplate(templateName){
  return getTemplate("js-templates/"+templateName+".mustache");
}

function getCPPTemplate(templateName){
  return getTemplate("js-templates/"+templateName+".mustache");

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
  return "/* TODO: "+ moduleName + " C++ */";
};


module.exports.genHeaderString = function(ast, moduleName){
  return "/* TODO: "+ moduleName + " Header */";
};


module.exports.genMakefileString = function(ast, moduleName){
  return "# TODO: "+ moduleName + " Makefile";
};


