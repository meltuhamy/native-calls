var argv = require('minimist')(process.argv.slice(2)),
    parser = require('webidl2'),

    reader = require('./IDLReader'),
    AugmentedAST = require('./AugmentedAST'),
    JSGen = require('./JSGenerator'),

    files = argv['_'],

    generate = argv['gen'];


var augAST = new AugmentedAST((parser.parse(reader.readFiles(files))));


if(generate == 'js'){
  console.log("Generating JavaScript");
  console.log(new JSGen(augAST));
} else {
  throw "Can't generate "+generate;
}