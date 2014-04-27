define(['tv4', 'lodash', 'TagLogger'], function(tv4, _, TagLogger){

  var globalTv4Identifier = 'native_calls';
  var globalPrefix = 'http://meltuhamy.com/'+globalTv4Identifier+'/';

  var IDLTypes = {
    "byte"               : {"type": "integer", "maximum": 127, "minimum": -128},
    "octet"              : {"type": "integer", "maximum": 255, "minimum": 0},
    "short"              : {"type": "integer", "maximum": 32767, "minimum": -32768},
    "unsigned short"     : {"type": "integer", "maximum": 65535, "minimum": 0},
    "long"               : {"type": "integer", "maximum": 2147483647, "minimum": -2147483648},
    "unsigned long"      : {"type": "integer", "maximum": 4294967295, "minimum": 0},
    "long long"          : {"type": "integer", "maximum": 9223372036854775807, "minimum": -9223372036854775808},
    "unsigned long long" : {"type": "integer", "maximum": 18446744073709551615, "minimum": 0},
    "any"                : {},
    "float"              : {"type": "number"},
    "DOMString"          : {"type": "string"},
    "boolean"            : {"type": "boolean"},
    "object"             : {"type": "object"},
    "null"               : {"type": "null"},
    "void"               : {"type": "null"}
  };

  function TypeChecker(moduleID){
    this.logger = new TagLogger('TypeChecker:'+moduleID);

    if(! _.isString(moduleID)){
      throw new Error("moduleID needs to be set and a string");
    }

    this.tv4 = tv4.freshApi(); //TODO: just found out about this. use it = don't need moduleID everywhere.

    this.setModuleID(moduleID);
    this.registerDefaultIDLTypes();
    this.extraTypes = {};

  }

  TypeChecker.prototype.registerDictionary = function(dict, moduleID){
    moduleID = _.isString(moduleID) ? moduleID : this.moduleID;
    if(!_.isString(moduleID)){
      throw new Error("Can't register type on undefined/non-string module id");
    }

    // dictionaries need to have a name
    if(!_.isString(dict.name)){
      throw new Error("Can't define a dictionary without a name");
    }

    var name = dict.name;

    // dictionary names are unique
    if(!_.isUndefined(this.extraTypes[name]) || !_.isUndefined(IDLTypes[name])){
      throw new Error("The dictionary name is not allowed / may be already defined: "+name);
    }

    // we augment the dictionary definition with *actual* references
    dict = this.augmentSchemaReferences(dict);

    // all dictionaries are objects
    dict.type = "object";

    // we add it to the extra types
    this.extraTypes[name] = dict;

    delete dict.name; // we use our own name now.

    // finally we register the type.
    this.registerType(name, dict, moduleID);
  };

  TypeChecker.prototype.augmentSchemaReferences = function(schemaObj){
    // recursively search the dict for $refs
    for(var prop in schemaObj){
      if(schemaObj.hasOwnProperty(prop)){
        if(prop === "$ref"){
          // it's a $ref! augment it with the actual schema!
          if(_.isObject(IDLTypes[schemaObj[prop]])){
            // it's a idl type
            schemaObj[prop] = this.generateIDLTypeURI(schemaObj[prop]);
          } else {
            // it's a module-specific type
            schemaObj[prop] = this.generateModuleTypeURI(schemaObj[prop]);
          }
        } else if(_.isObject(schemaObj[prop])) {
          // depth-first traverse
          schemaObj[prop] = this.augmentSchemaReferences(schemaObj[prop]);
        }
      }
    }

    return schemaObj;
  };

  TypeChecker.prototype.registerType = function(typeName, definition, moduleID){
    moduleID = _.isString(moduleID) ? moduleID : this.moduleID;
    if(!_.isString(moduleID)){
      throw new Error("Can't register type on undefined/non-string module id");
    }

    if(!_.isString(typeName)){
      throw new Error("Can't register type on undefined/non-string type name");
    }

    this.logger.debug('tv4.addSchema('+JSON.stringify(this.generateModuleTypeURI(typeName, moduleID))+', '+JSON.stringify(definition)+');');
    this.tv4.addSchema(this.generateModuleTypeURI(typeName, moduleID), definition);
  };

  TypeChecker.prototype.generateModuleTypeURI = function(typeName, moduleID){
    moduleID = _.isString(moduleID) ? moduleID : this.moduleID;
    return this.isRealURI(typeName)? typeName : globalPrefix+"modules/"+moduleID+"/"+typeName;
  };

  TypeChecker.prototype.generateIDLTypeURI = function(typeName){
    return this.isRealURI(typeName)? typeName : globalPrefix+"idl/"+typeName;
  };

  TypeChecker.prototype.isRealURI = function(uri){
    return (new RegExp('^'+globalPrefix)).test(uri);
  };

  TypeChecker.prototype.setModuleID = function(moduleID){
    this.moduleID = moduleID;
  };


  TypeChecker.prototype.registerDefaultIDLTypes = function(){
    // a bit hacky, but we augment tv4 to see if native_calls is there.
    if(this.tv4['native_calls'] === true){
      // TODO this check isn't quite right; because someone could call tv4.freshen();
      return;
    }

    this.tv4['native_calls'] = true;
    for(var typeName in IDLTypes) {
      if(IDLTypes.hasOwnProperty(typeName)){
//        this.logger.debug('tv4.addSchema('+JSON.stringify(this.generateIDLTypeURI(typeName))+', '+JSON.stringify(IDLTypes[typeName])+');');
        this.tv4.addSchema(this.generateIDLTypeURI(typeName), IDLTypes[typeName]);
      }
    }
  };

  TypeChecker.prototype.check = function(type, value, moduleID){
    if(!_.isString(type) && !_.isObject(type)){
      throw new Error("Type needs to be a defined string / json schema");
    }

    // if it's an object, augment it and validate directly
    if(_.isObject(type)){
      type = this.augmentSchemaReferences(type);
      try{
        return this.tv4.validate(value, type);
      } catch(e){
        this.logger.error(e);
        return false;
      }
    }

    // shortcut IDL types
    if(type === "undefined" || _.isObject(IDLTypes[type])){
      return this.checkIDL(type, value);
    }

    // other types require a module id.
    moduleID = _.isString(moduleID) ? moduleID : this.moduleID;
    if(!_.isString(moduleID)){
      throw new Error("Module ID needs to be a defined string");
    }

    try{
//      this.logger.debug('tv4.validate('+JSON.stringify(value)+', tv4.getSchema('+JSON.stringify(this.generateModuleTypeURI(type, moduleID))+');');
      return this.tv4.validate(value, this.tv4.getSchema(this.generateModuleTypeURI(type, moduleID)));
    } catch(e){
      // don't break everything just because tv4 crashed.
      this.logger.error(e);
      return false;
    }
  };

  TypeChecker.prototype.checkIDL = function(type, value){
    // it could be undefined
    if(_.isUndefined(value) && type === 'undefined'){
      return true;
    }

    try{
//      this.logger.debug('tv4.validate('+value+', tv4.getSchema('+JSON.stringify(this.generateIDLTypeURI(type))+'))');
      return this.tv4.validate(value, this.tv4.getSchema(this.generateIDLTypeURI(type)));
    } catch (e){
      // don't break everything just because tv4 crashed.
      this.logger.error(e);
      return false;
    }
  };

  return TypeChecker;


});