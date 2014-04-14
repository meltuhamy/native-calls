function ASTAugmenter(ast){
  "use strict";

  this.ast = ast;
  this.isAugmented = false;

  this.dictionaries = Object.create(null);
  this.interfaces = Object.create(null);
  this.typedefs = Object.create(null);
  this.exceptions = Object.create(null);
  this.enums = Object.create(null);
  this.primitiveTypes = ['any', 'boolean', 'byte', 'octet', 'short', 'unsigned short', 'long', 'unsigned long', 'long long', 'unsigned long long', 'float', 'unrestricted float', 'double', 'unrestricted double', 'DOMString'];
  this.allowedTypes = [];

  // we use this queue to keep track of members, etc. that we need to check.
  this.typeCheckQueue = [];

  // we use this to squash the array
  this.removedIndices = [];
}

ASTAugmenter.prototype.generateAllowedTypes = function(){
  "use strict";
  return this.primitiveTypes.concat(Object.keys(this.dictionaries), Object.keys(this.interfaces), Object.keys(this.typedefs), Object.keys(this.exceptions), Object.keys(this.enums));
};

ASTAugmenter.prototype.updateAllowedTypes = function(){
  "use strict";
  this.allowedTypes = this.generateAllowedTypes();
};


ASTAugmenter.prototype.addToTypeCheckQueue = function(t){
  "use strict";
  if(Array.isArray(t)){
    // concat
    this.typeCheckQueue = this.typeCheckQueue.concat(t);
  } else {
    // push
    this.typeCheckQueue.push(t);
  }
};

ASTAugmenter.prototype.checkType = function(t){
  "use strict";
  // t could be an operation, attribute, constant member.
  if(t.type === 'operation'){
    // check return type
    this.addToTypeCheckQueue(t.idlType);
    // check argument types
    this.addToTypeCheckQueue(t.arguments);
  } else if(t.type === 'attribute'){
    // TODO support attributes
  } else if(t.type === 'const'){
    // TODO Support constants
  } else if(t.idlType){
    // it could also be an IDL Type
    this.addToTypeCheckQueue(t.idlType);
  } else if((typeof t === 'string' || t instanceof String) && (this.allowedTypes.indexOf(t) > -1)){
    // it could also be a string representing a type (base case)
  } else {
    throw "Unsupported type: "+t;
  }

  return true;
};


ASTAugmenter.prototype.addDictionary = function(d, index){
  "use strict";
  //A dictionary looks like this
  //{ type: 'dictionary', name: 'Di', partial: false, members: [ [Object],[Object] ], inheritance: null, extAttrs: [] }

  // does the dictionary already exist?
  var existingDict = this.dictionaries[d.name];
  if(existingDict){
    // exists. Augment if partial, otherwise throw
    if(d.partial){
      existingDict.members = existingDict.members.concat(d.members);
      // add the new members to the check queue
      this.addToTypeCheckQueue(d.members);
      // get rid of duplicate
      this.ast[index] = null;
      this.removedIndices.push(index);
    } else {
      throw "The dictionary already exists: "+ d.name;
    }
  } else {
    // doesn't exist. Add it as a new key.
    this.dictionaries[d.name] = d;
    // add members
    this.addToTypeCheckQueue(d.members);
  }

  return true;
};

ASTAugmenter.prototype.addInterface = function(i, index){
  "use strict";
  //An interface looks like this
  //{type:'interface', name:'In', partial:false, members:[ [Object],[Object] ], inheritance:null, extAttrs:[] },
  // does the dictionary already exist?
  var existingI = this.interfaces[i.name];
  if(existingI){
    // exists. Augment if partial, otherwise throw
    if(i.partial){
      existingI.members = existingI.members.concat(i.members);
      // add the new members to the check queue
      this.addToTypeCheckQueue(i.members);
      this.ast[index] = null;
      this.removedIndices.push(index);
    } else {
      throw "The interface already exists: "+ i.name;
    }
  } else {
    // doesn't exist. Add it as a new key.
    this.interfaces[i.name] = i;
    this.addToTypeCheckQueue(i.members);
  }

  return true;
};

ASTAugmenter.prototype.processTypeCheckQueue = function(){
  "use strict";
  var q = this.typeCheckQueue;
  while(q.length !== 0){
    if(!this.checkType(q.pop())){
      throw "Type error";
    }
  }

  return true;
};

ASTAugmenter.prototype.augment = function(){
  "use strict";
  if(this.isAugmented){
    return true; //already augmented
  }

  var t = this.ast;
  // note, we visit everything in the TOP level only.
  // this limits the nodes that are supported.
  // the nodes inside are checked in their corresponding methods.
  for(var i = 0; i < t.length; i++){
    var type = t[i].type;
    if (type === 'interface') { // 3.2
      this.addInterface(t[i], i);
    } else if (type === 'dictionary') { //3.3
      this.addDictionary(t[i], i);
    } else if (type === 'exception') { //3.4
      // TODO Support exceptions
    } else if (type === 'enum') { //3.5
      // TODO Support enums
    } else if (type === 'callback') { //3.6
      // TODO Support callbacks
    } else if (type === 'typedef') { //3.7
      // TODO Support typedefs
    } else if (type === 'implements') { //3.8
      // TODO Support implements
    } else {
      throw "Type not supported at top level: " + t;
    }
  }

  // squash the ast
  var offset = 0;
  for(var iindex = 0; iindex < this.removedIndices.length; iindex++){
    this.ast.splice(this.removedIndices[iindex] - offset, 1);
    offset++;
  }
  this.removedIndices = [];


  // process the queue
  this.updateAllowedTypes();
  this.processTypeCheckQueue();

  // return
  this.isAugmented = true;
  var returned = this.ast; // ast is now augmented
  returned.augmenter = this; // we keep the info we collected in the process.

  return returned;
};


module.exports = ASTAugmenter;