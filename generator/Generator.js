
function getTemplate(templateSrc){
  return "";
}

module.exports.genJSString = function(ast, moduleName){
  return "/* TODO: "+ moduleName + " JS */";
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


