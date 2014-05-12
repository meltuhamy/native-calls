var _ = require("lodash");
var CPPHoganHelpers = require("./CPPHoganHelpers.js");

module.exports.getContext = function(ast, moduleName){
  var context = CPPHoganHelpers.getContext(ast, moduleName);
  context = _.assign(context, {
    numParams: function(){
      return (this.arguments ? this.arguments : []).length;
    }
  });

  return context;
};