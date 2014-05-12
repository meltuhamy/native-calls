var fs = require('fs');
var hogan = require('hogan.js');
var _ = require('lodash');

var JSHoganHelpers = require("./JSHoganHelpers.js"),
    CPPModuleHoganHelpers = require("./CPPModuleHoganHelpers.js"),
    CPPInterfaceHoganHelpers = require("./CPPInterfaceHoganHelpers.js"),
    CPPDictionaryHoganHelpers = require("./CPPDictionaryHoganHelpers.js"),
    MakefileHoganHelpers = require("./MakefileHoganHelpers.js");


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
  var context = JSHoganHelpers.getContext(ast, moduleName);
  return hogan.compile(getJSTemplate('rpcmodule')).render(context);
};



/*
C++ Code generation
 */

module.exports.genCPPString = function(ast, moduleName){

  var context = CPPModuleHoganHelpers.getContext(ast, moduleName);

  return hogan.compile(getCPPTemplate('cppmodule')).render(context);
};


module.exports.genInterfaceString = function(ast, interfaceName, moduleName){
  if(!ast.interfaces[interfaceName]){
    throw "Could not find interface "+interfaceName;
  }

  var context = CPPInterfaceHoganHelpers.getContext(ast, moduleName, interfaceName);
  return hogan.compile(getCPPTemplate("interface")).render(context);

};


module.exports.genDictionaryTypesString = function(ast, moduleName){
  var context = CPPDictionaryHoganHelpers.getContext(ast, moduleName);
  return hogan.compile(getCPPTemplate("types")).render(context);
};

module.exports.genMakefileString = function(ast, moduleName){
  var context = MakefileHoganHelpers.getContext(ast, moduleName);
  return hogan.compile(getCPPTemplate("Makefile")).render(context);
};


