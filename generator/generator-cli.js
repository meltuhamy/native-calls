var argv = require('minimist')(process.argv.slice(2)),
    parser = require('webidl2'),

    reader = require('./IDLReader'),
    Augmenter = require('./ASTAugmenter'),
    ast = require('./ast'),
    JSGen = require('./JSGenerator'),

    files = argv['_'],

    generate = argv['gen'];


var augAST = new Augmenter((parser.parse(reader.readFiles(files)))).augment();


if(generate == 'js'){
  console.log("Generating JavaScript");
  new JSGen(augAST);
} else {
  throw "Can't generate "+generate;
}

function generateJS(tree){
  "use strict";
  var ast = new ast.IfElse(true, [new ast.Line(new ast.Statement('return 4'))], [new ast.Line("// Else case!")]);
}