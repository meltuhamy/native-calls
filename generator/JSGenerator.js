var ast = require('./ast');


function Closure(params, body){
  "use strict";
  return new Node([new ast.Line(['function(', new ast.CommaList(params), '){ ']),
               new ast.Block(body),
               new ast.Line('}')]);
}

function RequireModule(dependencies, aliases, body){
  "use strict";
  aliases = Array.isArray(aliases) ? aliases : dependencies;
  var dependenciesStrings = [];
  for(var i = 0; i < dependencies.length; i++){
    var n = new ast.Primitive(dependencies[i]);
    dependenciesStrings.push(n);
  }
  var dependencyArrayNode = new ast.Array(dependenciesStrings);
  var closureNode = new Closure(aliases, body);

  return new Node([new ast.Line(new ast.Statement(['define(', dependencyArrayNode, closureNode, ')']))]);
}

function DictionaryDefinition(){
  "use strict";
  // todo
}

function Interface(){
  "use strict";
  // todo
}

function Types(){
  "use strict";
  // todo
}

function JSGenerator(augmentedAST){
  "use strict";
  var js = new ast.Node();

  // use the ast to generate a js tree.
  // generate dictionary definitions
  // generate interfaces
  // generate types

  // use above to generate module
  // a module contains: the allowed types, the dictionary definitions, the interface definitions (with stub specs)

  return js;

}

module.exports = JSGenerator;