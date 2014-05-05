var argv = require('minimist')(process.argv.slice(2)),
    parser = require('webidl2'),
    qfs = require('q-io/fs'),

    reader = require('./IDLReader'),
    AugmentedAST = require('./AugmentedAST'),
    Generator = require('./Generator'),


    files = argv['_'],
    generate = argv['gen'],
    genName = argv['name'],
    genPackage = argv['package'];


// create an ast
var augAST = new AugmentedAST((parser.parse(reader.readFiles(files))));


// maybe the caller wants just one file to stdout?
if(generate){
  if(generate == 'js'){
    console.log(Generator.genJSString(augAST, genName));
  } else if(generate == 'cpp') {
    console.log(Generator.genCPPString(augAST, genName));
  } else if(generate == 'makefile'){
    console.log(Generator.genMakefileString(augAST, genName));
  } else {
    // make a package
    console.error("Generating " + generate + " files is not really my job. Exiting.");
    process.exit();
  }
  process.exit();
}

// todo, use cross-platform paths (using '/' is bad...)
// todo create a different header file for each *interface*
if(typeof genPackage == "string"){
  // create a module folder called genPackage
  var packagePath = __dirname + "/" + genPackage;
  console.log("Creating directory... (" + packagePath + ")");
  qfs.makeDirectory(packagePath)
      .then(function(){
        var jsString = Generator.genJSString(augAST, genPackage);
        var jsFileName = packagePath + "/" + genPackage + "RPC.js";
        console.log("Creating JS File... ("+jsFileName+")");
        return qfs.write(jsFileName, jsString);
      })
      .then(function(){
        var cppString = Generator.genCPPString(augAST, genPackage);
        var cppFileName = packagePath + "/" + genPackage + "RPC.cpp";
        console.log("Creating C++ File... ("+cppFileName+")");
        return qfs.write(cppFileName, cppString);
      })
      .then(function(){
        var headerString = Generator.genHeaderString(augAST, genPackage);
        var headerFilename = packagePath + "/" + genPackage + ".h";
        console.log("Creating header file(s)... (" + headerFilename + ")");
        return qfs.write(headerFilename, headerString);
      })
      .then(function(){
        var makefileString = Generator.genMakefileString(augAST, genPackage);
        var makefileFileName = packagePath + "/Makefile";
        console.log("Creating Makefile... (" + makefileFileName + ")");
        return qfs.write(makefileFileName, makefileString);
      })
      .then(function(){
        console.log("Done.");
      })
      .done();
}
