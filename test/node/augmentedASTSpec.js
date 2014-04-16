var AugmentedAST = require('../../generator/AugmentedAST');
var parser = require('webidl2');

describe('Augmented AST', function () {

  it('should construct with an abstract syntax tree', function () {
    var ast = parser.parse('');
    new AugmentedAST(ast);
  });



  it('should augment the ast with itself', function(){
    var ast = parser.parse('');
    var augmented = new AugmentedAST(ast);
    expect(augmented.ast.augmenter).toBe(augmented);
  });



  it('should join partial dictionary definitions', function(){
    var ast = parser.parse('partial dictionary MyDict{ long myKey; }; partial dictionary MyDict{ long secondKey; };');
    expect(ast.length).toBe(2); // i.e. 2 definitions

    var augmentedAST = new AugmentedAST(ast);
    expect(augmentedAST.ast.length).toBe(1); // joined definition
    expect(augmentedAST.ast[0].members.length).toBe(2);
    expect(augmentedAST.ast[0].members[0].name).toBe('myKey');
    expect(augmentedAST.ast[0].members[1].name).toBe('secondKey');
  });



  it('should join partial interface definitions', function(){
    var ast = parser.parse('partial interface MyInterface{ long myOp(long p); }; partial interface MyInterface{ long secondOp(); };');
    expect(ast.length).toBe(2); // i.e. 2 definitions

    var augmentedAST = new AugmentedAST(ast);
    expect(augmentedAST.ast.length).toBe(1); // joined definition
    expect(augmentedAST.ast[0].members.length).toBe(2);
    expect(augmentedAST.ast[0].members[0].name).toBe('myOp');
    expect(augmentedAST.ast[0].members[1].name).toBe('secondOp');
  });



  it('should have a map of dictionary definitions', function(){
    var ast = parser.parse('dictionary MyDict{ long myKey; };');
    var augmentedAST = new AugmentedAST(ast);
    var dictionaries = augmentedAST.dictionaries;
    expect(Object.keys(dictionaries)).toEqual(['MyDict']);

    expect(dictionaries.MyDict).toBeDefined();
    expect(dictionaries.MyDict.members).toBeDefined();
    expect(dictionaries.MyDict.members.length).toBe(1);
    expect(dictionaries.MyDict.members[0].name).toBe('myKey');
  });



  it('should have a map of interface definitions', function(){
    var ast = parser.parse('interface myInterface{ long myKey(); };');
    var augmentedAST = new AugmentedAST(ast);
    var interfaces = augmentedAST.interfaces;
    expect(Object.keys(interfaces)).toEqual(['myInterface']);

    expect(interfaces.myInterface).toBeDefined();
    expect(interfaces.myInterface.members).toBeDefined();
    expect(interfaces.myInterface.members.length).toBe(1);
    expect(interfaces.myInterface.members[0].name).toBe('myKey');
  });



  it('should throw errors when an interface or dictionary is defined twice', function(){
    var ast = parser.parse('interface myInterface{ long myKey(); }; interface myInterface{};');
    expect(function(){
      new AugmentedAST(ast).augment();
    }).toThrow();

    ast = parser.parse('dictionary myDict{ long myKey; }; dictionary myDict{};');
    expect(function(){
      new AugmentedAST(ast).augment();
    }).toThrow();
  });



  it('should throw error for undefined types', function(){
    expect(function(){
      var ast = parser.parse('dictionary MyDict{ UndefinedType myKey; };');
      new AugmentedAST(ast).augment();
    }).toThrow();
  });



  it('should allow easy access to operations of an interface', function(){
    var ast = parser.parse('dictionary MyDict{ long myLong; }; interface MyInterface { long myOp( MyDict param); };');
    var augmentedAST = new AugmentedAST(ast);

    expect(augmentedAST.interfaces.MyInterface.operations).toBeDefined();
  });


  it('should allow dictionary types in operations', function(){
    var ast = parser.parse('dictionary MyDict{ long myLong; }; interface MyInterface { long myOp( MyDict param); };');
    var augmentedAST = new AugmentedAST(ast);

    expect(AugmentedAST.getTypeName(augmentedAST.interfaces.MyInterface.operations[0].arguments[0])).toBe('MyDict');

  });


  it('should have helper functions to check types', function(){
    var ast = parser.parse('dictionary MyDict{ long myLong; }; interface MyInterface { long myOp( MyDict param); };');
    var augmentedAST = new AugmentedAST(ast);

    expect(augmentedAST.isPrimitiveType(augmentedAST.dictionaries.MyDict.members[0])).toBe(true);
    expect(augmentedAST.isPrimitiveType(augmentedAST.interfaces.MyInterface.operations[0])).toBe(true);
    expect(augmentedAST.isDictionaryType(augmentedAST.interfaces.MyInterface.operations[0])).toBe(false);
    expect(augmentedAST.isDictionaryType(augmentedAST.interfaces.MyInterface.operations[0].arguments[0])).toBe(true);

    expect(augmentedAST.isInterfaceType('MyInterface')).toBe(true);

  });

});

