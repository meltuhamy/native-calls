var ast = require('../../generator/ast');

describe('Abstract Syntax Tree', function(){
  beforeEach(function() {
    this.addMatchers({
      toBeInstanceOf: function(expectedInstance) {
        var actual = this.actual;
        var notText = this.isNot ? " not" : "";
        this.message = function() {
          return "Expected " + actual.constructor.name + notText + " is instance of " + expectedInstance.name;
        };
        return actual instanceof expectedInstance;
      }
    });
  });



  it('should allow constructing nodes', function(){
    new ast.Node();
  });



  it('should allow adding children', function(){
    var n = new ast.Node();
    n.addChild(new ast.Node());

    expect(n.children.length).toBe(1);
  });



  it('should allow adding a list of children', function(){
    var n = new ast.Node();
    n.addChildren([new ast.Node(), new ast.Node()]);
    expect(n.children.length).toBe(2);
  });



  it('should allow giving children in the constructor', function(){
    var n = new ast.Node(new ast.Node());
    expect(n.children.length).toBe(1);
    n = new ast.Node([new ast.Node(), new ast.Node()]);
    expect(n.children.length).toBe(2);
  });



  it('should allow wrap primitive types with TextNode', function(){
    var n = new ast.Node('Primitive');
    expect(n.children.length).toBe(1);
    expect(n.children[0]).toBeInstanceOf(ast.Text);
  });



  it('should allow method chaining', function(){
    var n = new ast.Node().addChild('h').addChildren(['e', 'l', 'l']).addChild('o').compile();
    expect(n).toBe('hello');
  });



  it('should not add a child if the child is not primitive or not a node', function(){
    var n = new ast.Node();
    expect(function(){
      n.addChild({"not":"allowed"});
    }).toThrow();
  });



  it('should allow adding an array of primitive types by wrapping them with TextNode', function(){
    var children = ['str', true, false, 2];
    var n = new ast.Node(children);
    expect(n.children.length).toBe(4);
    for(var i = 0; i < n.children.length; i++){
      expect(n.children[i]).toBeInstanceOf(ast.Text);
      expect(n.children[i].content).toBe(children[i]);
    }
  });



  it('should not allow text nodes to have children', function(){
    var content = 'content';
    var text = new ast.Text(content);
    expect(text.children.length).toBe(0);
    expect(function(){
      // adding a child should throw
      text.addChild('1');
    }).toThrow();

    expect(text.content).toBe(content);
  });



  it('should compile text nodes to give the toString of the content', function(){
    spyOn(Object.prototype, 'toString').andCallThrough();
    var content = {};
    var n = new ast.Text(content);
    var compiledString = n.compile();
    expect(content.toString).toHaveBeenCalled();
    expect(compiledString).toBe(content.toString());
  });



  it('should recursively compile a tree', function(){
    spyOn(ast.Node.prototype, 'compile').andCallThrough();

    // create a tree with depth 3
    var tree = new ast.Node(new ast.Node(new ast.Node()));
    tree.compile();
    expect(ast.Node.prototype.compile.calls.length).toBe(3);
  });



  it('should support terminating nodes of different terminating characters', function(){
    var t = new ast.Terminating();
    t.setTerminator('!');
    expect(t.compile()).toBe('!');
  });



  it('should compile line nodes by prefixing them with an indent corresponding to the level', function(){
    var content = 'content';
    var line = new ast.Line(content);
    expect(line.compile(1)).toBe("  "+content+"\n"); // level: 1
    expect(line.compile(2)).toBe("    "+content+"\n"); // level: 2
  });



  it('should compile a block node by increasing the compile depth', function(){
    spyOn(ast.Node.prototype, 'compile').andCallThrough();

    var child = new ast.Node();
    var block = new ast.Block(child);

    block.compile(); //implicitly, this is level 0.

    expect(child.compile).toHaveBeenCalledWith(1);

    block.compile(23);
    expect(child.compile).toHaveBeenCalledWith(24);

    // nested blocks
    var child = new ast.Node();
    var block = new ast.Block(new ast.Block(child));

    block.compile(123);
    expect(child.compile).toHaveBeenCalledWith(125); // +2 because we're 2 blocks deeper

  });



  it('should support primitive nodes', function(){
    var primitive = new ast.Primitive(1);
    expect(primitive.compile()).toBe('1');

    primitive = new ast.Primitive(true);
    expect(primitive.compile()).toBe('true');

    primitive = new ast.Primitive(false);
    expect(primitive.compile()).toBe('false');

    primitive = new ast.Primitive("string");
    expect(primitive.compile()).toBe('"string"');
  });



  it('should concatenate a list of text nodes', function(){
    var nodesList = new ast.Node(['1','2','3','a','b','c']);
    expect(nodesList.compile()).toBe('123abc');
  });



  it('should end statement nodes in a semicolon', function(){
    var statement = new ast.Statement('Hello');
    expect(statement.compile().slice(-1)).toBe(';')
  });



  it('should separate children in a CommaList node by commas', function(){
    var commaList = new ast.CommaList([1,2,3,4,5]);
    var splitList = commaList.compile().split(', ');
    expect(splitList).toEqual(['1','2','3','4','5']);
  });



  it('should construct arrays by giving it an array of nodes', function(){
    var arrayString = new ast.Array([1,new ast.Primitive("2"),3,4,5]);
    expect(arrayString.compile()).toBe('[1, "2", 3, 4, 5]');
  });



});

