#!/usr/bin/env node
var argv = require('minimist')(process.argv.slice(2)),
    parser = require('webidl2'),
    qfs = require('q-io/fs'),

    reader = require('./IDLReader'),
    AugmentedAST = require('./AugmentedAST'),
    Generator = require('./Generator'),


    files = argv['_'],
    generate = argv['gen'],
    genName = argv['name'],
    genPackage = argv['package'],

    cwd = process.cwd(),
    Q = require('q');

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
  var packagePath = cwd + "/" + genPackage;
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
        // actually, we need to generate a header string for each interface!
        // we also generate 1 header string for all dictionary definitions.
        var headerFilename, headerString;
        var returned = [];
        for(var interfaceName in augAST.interfaces){
          headerString = Generator.genInterfaceString(augAST, interfaceName, genPackage);
          headerFilename = packagePath + "/PPRPCGEN_" + interfaceName + ".h";
          console.log("Creating header file... (" + headerFilename + ")");
          returned.push(qfs.write(headerFilename, headerString));
        }

        if(Object.keys(augAST.dictionaries).length > 0){
          // we'll need to generate the types
          headerFilename = packagePath + "/PPRPCGEN_" + genPackage + "Types.h";
          headerString = Generator.genDictionaryTypesString(augAST, genPackage);
          console.log("IDL defines some dictionary types.\nCreating header file... (" + headerFilename + ")");
          returned.push(qfs.write(headerFilename, headerString));
        }
        return Q.all(returned);
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
