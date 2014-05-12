// Although these tests test some functionality of the generator, they don't test the actual string output.
// E2E tests do this, as successful generation, compilation, and module embedding are required for the tests to pass.

var srcDirPrefix = "../../generator/";

describe("JS generator", function(){
  // todo js generator context tests
  var Helpers = require(srcDirPrefix + "JSHoganHelpers.js");
});

describe("C++ Module Generator", function(){
  // todo c++ module generator context tests
  var Helpers = require(srcDirPrefix + "CPPModuleHoganHelpers.js");

});

describe("Dictionary types generator", function(){
  // todo c++ dictionary types generator tests
  var Helpers = require(srcDirPrefix + "CPPDictionaryHoganHelpers.js");

});

describe("C++ Interface generator", function(){
  // todo c++ interface context tests
  var Helpers = require(srcDirPrefix + "CPPInterfaceHoganHelpers.js");

});

describe("Makefile generator", function(){
  // todo makefile context tests
  var Helpers = require(srcDirPrefix + "MakefileHoganHelpers.js");

});

