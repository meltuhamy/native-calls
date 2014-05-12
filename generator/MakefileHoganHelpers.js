var _ = require("lodash");

module.exports.getContext = function(ast, moduleName){
  return {
    moduleName: moduleName,
    timestamp: ""+(new Date()),
    interfaces: ast.getInterfaceArray()
  };
};
