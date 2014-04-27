define(['RPCRuntime', 'lodash', 'TagLogger', 'TypeChecker'], function(RPCRuntime, _, TagLogger, TypeChecker){
  var logger = new TagLogger("Stub");

  // RPCInterface
  function RPCInterface(rpcStub, name){
    this.stub = rpcStub;
    this.name = name;
    this.functionMap = Object.create(null);
  }

  RPCInterface.prototype.FUNCTION_DEFINITION_SCHEMA = {
    "type": "object",
    "required": ["name"],
    "properties": {
      "name": {"type": "string"},
      "params": {"type": "array", "items": {"type": ["object", "string"]} },
      "returnType": {"type": ["object", "string"]}
    }
  };

  RPCInterface.prototype.isValidFunctionDefinition = function(functionDefinition){
    var validFunctionDefinition = false;
    try{
      validFunctionDefinition = this.stub.type.tv4.validate(functionDefinition, this.FUNCTION_DEFINITION_SCHEMA);
    } catch(e){
      logger.error(e);
      validFunctionDefinition = false;
    }
    return validFunctionDefinition;
  };

  RPCInterface.prototype.constructFunction = function(defn){
    var defnName = defn.name,
        interfacePrefix = this.name + "::";
        defnParams = _.isArray(defn.params) ? defn.params : [],
        defnParamsLength = defn.params.length,
        defnReturnType = _.isObject(defn.returnType) ? defn.returnType : {"$ref": "any"},
        type = this.stub.type,
        runtime = this.stub.runtime,
        body = function () {
          var args = Array.prototype.slice.call(arguments, 0);

          // the expected number of parameters is known, defnParamsLength.
          // if the user gives more params, then these are probably callbacks.

          // we extract the callbacks
          var userSuccessCallback, userErrorCallback, userParams;
          if (args.length > defnParamsLength) {
            userSuccessCallback = args[defnParamsLength];
            userErrorCallback = args[defnParamsLength + 1];
          }

          // we extract the user given parameters
          userParams = args.slice(0, defnParamsLength);

          if (userParams.length !== defnParamsLength) {
            throw new TypeError("The function "+defnName+" expects " + defnParamsLength + " parameter(s) but received " + userParams.length);
          }

          // now we go through each parameter and assert it is valid.
          for (var i = 0; i < userParams.length; i++) {
            if (!type.check(defnParams[i], userParams[i])) {
              throw new TypeError("Parameter " + i + " has " + type.tv4.error.message + (type.tv4.error.dataPath ? (" [at "+ type.tv4.error.dataPath.replace(/\//g,'.') +"]" ): ""));
            }
          }

          // before calling the runtime, we alter the callback
          var callback = function (d) {
            // check response is of correct type.
            if (!type.check(defnReturnType, d)) {
              if (_.isFunction(userErrorCallback)) {
                userErrorCallback.call(null, {
                  "code": -32000,
                  "message": defnName+" returned " + type.tv4.error.message + (type.tv4.error.dataPath ? (" [at "+ type.tv4.error.dataPath.replace(/\//g,'.') +"]" ): ""),
                  "data": d
                });
              }
            } else {
              userSuccessCallback.call(null, d);
            }
          };


          // finally call the runtime
          // todo call runtime based on interface name, e.g. by calling interfaceName::defnName instead of just defnName
          return runtime.sendRequest(interfacePrefix+defnName, userParams, callback, userErrorCallback);
        };

    // wrap the work around the function so it looks neater to the user in the console window :)
    return function(){return body.apply(null, arguments)};
  };

  RPCInterface.prototype.definitionToSchema = function(def){
    // two things to schema-ise: the returnType and the params array.
    if(_.isString(def.returnType)){
      def.returnType = {"$ref": def.returnType};
    }

    for(var i = 0; i < def.params.length; i++){
      if(_.isString(def.params[i])){
        def.params[i] = {"$ref": def.params[i]};
      }
    }
    return def;
  };

  RPCInterface.prototype.addFunction = function(functionDefinition){
    if (!this.isValidFunctionDefinition(functionDefinition)) {
      throw new Error("Couldn't add function since it doesn't have a valid definition. Details ", this.stub.type.tv4.error);
    }
    var functionName = functionDefinition.name;
    var functionParams = functionDefinition.params;
    var functionReturnType = functionDefinition.returnType;

    if(!_.isUndefined(this.functionMap[functionName])){
      throw new Error("A function with that name is already defined: "+JSON.stringify(functionName));
    }

    var defnSchema = this.definitionToSchema(functionDefinition);

    this.functionMap[functionName] = {
      definition: defnSchema,
      fn: this.constructFunction(defnSchema)
    };

    return this;
  };

  RPCInterface.prototype.getFunction = function(name){
    return this.functionMap[name].fn;
  };


  RPCInterface.prototype.toMap = function(){
    var map = Object.create(null);
    for(var fnName in this.functionMap){
      map[fnName] = this.functionMap[fnName].fn;
    }

    return map;
  };











  // RPCStub

  /**
   * Use this RPCStub class to dynamically construct stub functions for remote procedure calls.
   * @param rpcRuntime The RPCRuntime to use to send RPC calls.
   * @constructor
   */
	function RPCStub(rpcRuntime){
    // a stub requires a runtime
    if(_.isUndefined(rpcRuntime)){
      throw new Error("RPCStub needs a runtime");
    }

    this.runtime = rpcRuntime;
    this.type = new TypeChecker(this.getModule().id);
    this.interfaceMap = new Object(null);
    this.dictionaryMap = new Object(null);

	}

  RPCStub.prototype.getModule = function(){
    return this.runtime.getModule();
  };

  RPCStub.prototype.addInterface = function(interfaceName){
    // interfaceName could be an object or a string
    var functionsToAdd = [];
    var name = interfaceName;
    if(_.isObject(interfaceName)){
      functionsToAdd = _.isArray(interfaceName.functions) ? interfaceName.functions : [];
      name = interfaceName.name;
    }

    if(!_.isUndefined(this.interfaceMap[name])){
      throw new Error("An interface with that name already exists "+JSON.stringify(name));
    }

    var addedInterface = new RPCInterface(this, name);

    for(var i = 0; i < functionsToAdd.length; i++){
      addedInterface.addFunction(functionsToAdd[i]);
    }

    this.interfaceMap[name] = addedInterface;

    return addedInterface;
  };

  RPCStub.prototype.getInterface = function(interfaceName){
    return this.interfaceMap[interfaceName];
  };


  RPCStub.prototype.addDictionary = function(dictionaryDefinition){
    // it needs to be an object!
    if(!_.isObject(dictionaryDefinition)){
      throw new TypeError("Expected an object but got "+dictionaryDefinition);
    }

    if(!_.isUndefined(this.dictionaryMap[dictionaryDefinition.name])){
      throw new Error("A dictionary with that name already exists");
    }

    this.dictionaryMap[dictionaryDefinition.name] = dictionaryDefinition;
    this.type.registerDictionary(dictionaryDefinition);

  };

  RPCStub.prototype.getDictionary = function(dictionaryName){
    return this.dictionaryMap[dictionaryName];
  };


	return RPCStub;
});
