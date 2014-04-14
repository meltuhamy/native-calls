var util = require("util");

/**
 * A base class node that is in a Abstract Syntax Tree
 * @param [child] The child / array of children nodes to add after this node's construction
 * @constructor
 */
function ASTNode(child){
  "use strict";
  this.children = [];
  this.parent = undefined;
  this.content = '';

  if(child != undefined){
    this.addChild(child);
  }
}

/**
 * Add a child / array of children to this node's list of children.
 * If the child is given as a primitive type, a new TextNode will be created.
 * If the child is actually an array, it will interpret the array as a list of child nodes to add recursively to this
 * node's list of children.
 * @param child
 * @returns {*}
 */
ASTNode.prototype.addChild = function(child){
  var node; //the node to add.
  // if child is primitive, add it as a text node
  if(["number", "string", "boolean"].indexOf(typeof child) !== -1){
    // add it as a text node
    node = new TextNode(child);
  } else if(child instanceof ASTNode){
    node = child;
  } else if(Array.isArray(child)){
    // list of children
    return this.addChildren(child);
  } else {
    throw "Can't add a child that isn't a node or primitive: "+child;
  }

  this.children.push(node);
  node.parent = this;
  return this;
};

/**
 * Adds the list of children given as children nodes to this node.
 * @param nodes
 * @returns {ASTNode}
 */
ASTNode.prototype.addChildren = function(nodes){
  for(var i = 0 ; i < nodes.length; i++){
    this.addChild(nodes[i]);
  }
  return this;
};

/**
 * Returns a string representation of the tree whose root is this node.
 * Level is passed to indent line nodes.
 * @param level
 * @returns {string}
 */
ASTNode.prototype.compile = function(level){
  "use strict";
  // print all my children.
  // if we come across a block, push it to the stack
  var str = '';
  for(var i = 0; i < this.children.length ; i++){
    str += this.children[i].compile(level);
  }
  return str;
};



/**
 * A basic node that only contains text and has no children.
 * @param text
 * @constructor
 */
function TextNode(text){
  "use strict";
  ASTNode.call(this);
  this.content = text;
}
util.inherits(TextNode, ASTNode);

/**
 * You can't add children to a text node. Text node is a 'base case' type.
 * @override
 */
TextNode.prototype.addChild = function(){
  "use strict";
  throw "Can't add a child to a text node";
};

/**
 * Compiling a text node is the same as returning its content.
 * @override
 * @returns {*}
 */
TextNode.prototype.compile = function(){
  "use strict";
  // base case: content
  return this.content.toString();
};




/**
 * A terminating node ends in a terminating character e.g. ";"
 * @constructor
 */
function TerminatingNode(child, terminator){
  "use strict";
  this.terminator = '';
  ASTNode.call(this, child);
  if(terminator){
    this.setTerminator(terminator)
  }
}
// Inheritance from ASTNode
util.inherits(TerminatingNode, ASTNode);

/**
 * Sets the terminating character of the terminating node.
 * @param terminator
 * @returns {TerminatingNode}
 */
TerminatingNode.prototype.setTerminator = function(terminator){
  "use strict";
  this.terminator = terminator;
  return this;
};

/**
 * Compiling a terminating node is the same as compiling its children and following it with the terminating character.
 * @param level
 * @returns {string}
 */
TerminatingNode.prototype.compile = function(level){
  "use strict";
  return ASTNode.prototype.compile.call(this, level) + this.terminator.toString();
};




/**
 * A line node ends in \n. It also has a line prefix (used for indents for example).
 * @constructor
 */
function LineNode(childNode){
  "use strict";
  TerminatingNode.call(this, childNode);
  this.setTerminator("\n");
}

util.inherits(LineNode, TerminatingNode);

/**
 * Returns a number of spaces representing the level given.
 * These spaces will be a prefix to the content of the line.
 * @param level
 * @returns {string}
 */
LineNode.prototype.getIndentString = function(level){
  "use strict";
  var str = '';
  for(var i = 0; i<level; i++){
    str+='  ';
  }
  return str;
};

/**
 * Compiling a line node is the same as compiling the terminating node, and prefixing the result with the indentation
 * @param level
 * @returns {string}
 */
LineNode.prototype.compile = function(level){
  "use strict";
  return this.getIndentString(level) + TerminatingNode.prototype.compile.call(this, level);
};


/**
 * A syntactic type of node used for indenting stuff later on.
 * @constructor
 * @param child
 */
function BlockNode(child){
  "use strict";
  ASTNode.call(this, child);
}

util.inherits(BlockNode, ASTNode);

/**
 * Compiling the block node simply compiles all its children with an incremented level.
 * @param level
 * @returns {string}
 */
BlockNode.prototype.compile = function(level){
  "use strict";
  // print all my children at a higher level
  return ASTNode.prototype.compile.call(this, level+1);
};




/**
 * Returns a C-style if block.
 * @param conditionNode the node inside the if()
 * @param bodyNodes an array of nodes to put in the body of the if
 * @returns {ASTNode}
 * @constructor
 */
function IfNode(conditionNode, bodyNodes){
  "use strict";
  return new ASTNode([new LineNode(["if (", conditionNode, "){"]),
                      new BlockNode(bodyNodes),
                      new LineNode("}")]);
}

/**
 * Returns a C-style if-else block.
 * @param cond
 * @param trueBody
 * @param falseBody
 * @returns {ASTNode}
 * @constructor
 */
function IfElseNode(cond, trueBody, falseBody){
  "use strict";
  return new ASTNode([new IfNode(cond, trueBody),
                      new LineNode('else { '),
                      new BlockNode(falseBody),
                      new LineNode('}')]);
}

/**
 * Returns a C-style statement node. i.e. the node followed by a ';'
 * @param node
 * @returns {TerminatingNode}
 * @constructor
 */
function StatementNode(node){
  "use strict";
  return new TerminatingNode(node, ';');
}

/**
 * Given a primitive javscript object, returns it as a node.
 * For example, if given a string, returns the string in quotations in a TextNode.
 * If given a number, returns the number in a TextNode.
 * If given a boolean, returns the boolean in a TextNode.
 * @param prim
 * @returns {TextNode}
 * @constructor
 */
function JSPrimitiveNode(prim){
  "use strict";
  return new TextNode(JSON.stringify(prim));
}

/**
 * Given an array of nodes, returns the nodes separated by TextNodes containing a ', '.
 * @param array
 * @returns {ASTNode}
 * @constructor
 */
function CommaListNode(array){
  "use strict";
  var node = new ASTNode();
  for(var i = 0; i < array.length-1; i++){
    node.addChild(array[i]);
    node.addChild(', ');
  }
  return node;
}

/**
 * Given an array of nodes, returns the array of nodes wrapped in '[' and ']' characters and separated by commas.
 * @param elements
 * @returns {ASTNode}
 * @constructor
 */
function ArrayNode(elements){
  "use strict";
  return new ASTNode(["[", new CommaListNode(elements), "]"]);
}



module.exports = {
  Node: ASTNode,
  Text: TextNode,
  Terminating: TerminatingNode,
  Line: LineNode,
  Block: BlockNode,
  If: IfNode,
  IfElse: IfElseNode,
  Statement: StatementNode,
  Primitive: JSPrimitiveNode,
  CommaList: CommaListNode,
  Array: ArrayNode
};