define(['RPCRuntime', 'IDLTypeMap', 'lodash', 'TagLogger'], function(RPCRuntime, IDLTypeMap, _, TagLogger){
  var logger = new TagLogger("Stub");

  /**
   * Use this RPCStub class to dynamically construct stub functions for remote procedure calls.
   * @param rpcRuntime The RPCRuntime to use to send RPC calls.
   * @constructor
   */
	function RPCStub(rpcRuntime){
    // a stub requires a runtime
    if(_.isUndefined(rpcRuntime)){
      throw new Error("RPCStub needs a runtime");
    } else {
      this.runtime = rpcRuntime;
    }
	}

  // Shortcut. Think of it as a static version of 'this'
  var THIS = RPCStub.prototype;

  /**
   * These are all the allowed IDL Types.
   * @type {Array}
   */
  THIS.supportedTypes = Object.keys(IDLTypeMap);

  /**
   * Checks if the given type is one of the supported types.
   * @param type
   * @returns {*}
   */
  THIS.isSupportedType = function(type){
    // it could either be a string, undefined ( same as 'void') or an array.
    if(_.isUndefined(type)){
      return true;
    } else if(_.isString(type)){
      // check the string is in the supported types.
      return _.contains(THIS.supportedTypes, type);
    } else if(_.isArray(type) && type.length === 1){
      return THIS.isSupportedType(type[0]); //recursive
    } else {
      return false;
    }
  };

  /**
   * Validates the stub spec by checking the return type is supported and each parameter type is supported.
   * @param stubSpec
   * @returns {boolean}
   */
  THIS.checkStubSpecAndThrow = function (stubSpec) {
    // the stubspec needs to have a name
    if (!(_.isObject(stubSpec) && _.isString(stubSpec.name))) {
      throw new TypeError("A stubspec needs to be an object with a string name property.");
    }

    // check the return type
    if (!THIS.isSupportedType(stubSpec.returnType)) {
      throw new TypeError("The return type is not supported: " + stubSpec.returnType);
    }


    // check the parameter types
    if(!_.isUndefined(stubSpec.dictionaries)){
      if(!_.isArray(stubSpec.dictionaries)){
        // todo throw?
      }

      // todo check dictionaries

    } else if (!_.isUndefined(stubSpec.params)) {
      if(!_.isArray(stubSpec.params)){
        throw new TypeError("The parameters needs to be an array of strings");

      }

      for (var i = 0; i < stubSpec.params.length; i++) {
        if (!THIS.isSupportedType(stubSpec.params[i])) {
          throw new TypeError("The stub parameter #" + i + " is not supported: " + stubSpec.params[i]);
        }
      }
    }

    // if we got to here, all is good :)
    return true;
  };


  /**
   * Checks that a variable x is of supported IDL type type.
   * @param x The variable to check
   * @param type The type to assert x is of.
   * @returns boolean
   */
  THIS.checkType = function(x, type){
    // first check the type is supported.
    if(!THIS.isSupportedType(type)){
      return false;
    }

    // if we're expecting undefined and the value is undefined, then it's correct type.
    if(_.isUndefined(type) && _.isUndefined(x)){
      return true;
    }

    // Now, let's see if it's a normal vs array type
    if(_.isString(type)){
      // normal type. Look for it in the IDLType map to get our checker function.
      return THIS["is"+IDLTypeMap[type]](x);

    } else if(_.isArray(type) && _.isArray(x)) {
      // array type. Go through each element and check it's the correct type
      for(var i = 0; i < x.length; i++){
        if(!THIS.checkType(x[i], type[0])){
          return false;
        }
      }
      return true;
    } else {
      // it's neither / x isn't an array
      return false;
    }
  };


  /**
   * Constructs a function that makes the RPC call.
   * @param stubSpec
   * @returns Function
   */
  THIS.constructStub = function (stubSpec) {
    THIS.checkStubSpecAndThrow(stubSpec);
    var checkParams, checkReturn, stubThis = this, specNumParams = 0, stubParams = stubSpec.params;

    if (_.isArray(stubParams)) {
      specNumParams = stubParams.length;

      // sort out parameter checking
      checkParams = function (argumentsArray) {
        if (specNumParams !== argumentsArray.length) {
          throw new TypeError("Number of arguments (" + argumentsArray.length + ") doesn't match spec (" + specNumParams + ").")
        }
        for (var i = 0; i < argumentsArray.length; i++) {
          if (!stubThis.checkType(argumentsArray[i], stubSpec.params[i])) {
            throw new TypeError("Expected param #" + i + " to be of type " + stubSpec.params[i] + ", but it is: " + argumentsArray[i]);
          }
        }
      };

    } else {
      specNumParams = 0;
      checkParams = function () {
        return true;
      };
    }

    if (!_.isUndefined(stubSpec.returnType)) {
      // sort out return type
      checkReturn = function (result) {
        return stubThis.checkType(result, stubSpec.returnType);
      };
    } else {
      // if we weren't given a returnType, assume we don't want to check it (i.e. it is 'Any')
      checkReturn = function () {
        return true;
      };
    }

    // finally, construct the actual function
    return function () {
      // turn the arguments into an array
      var args = Array.prototype.slice.call(arguments, 0);

      // the expected number of parameters is known, specNumParams.
      // if the user gives more params, then these are probably callbacks.

      // we extract the callbacks
      var userSuccessCallback, userErrorCallback, userParams;
      if (args.length > specNumParams) {
        userSuccessCallback = args[specNumParams];
        userErrorCallback = args[specNumParams + 1];
      }

      // we extract the user given parameters
      userParams = args.slice(0, specNumParams);

      // we check the parameters are correct type
      checkParams(userParams);

      // finally, we call the rpc runtime
      return stubThis.runtime.sendRequest(stubSpec.name, userParams, function (result) {
        // we do an extra step of checking the result
        if (checkReturn(result)) {
          // success.
          if (_.isFunction(userSuccessCallback)) {
            userSuccessCallback.call(null, result);
          }
        } else {
          // failure. incorrect type
          if (_.isFunction(userErrorCallback)) {
            userErrorCallback.call(null, {"code": -32000,
              "message": "returned result is not of correct type",
              "data": "Expected " + stubSpec.returnType + ", received " + result});
          }
        }

      }, userErrorCallback);


    }

  };


  // Type checking functions
  THIS.isInteger = function(x){
    return _.isNumber(x) && x === (x|0);
  };

  THIS.isByte = function(x){
    return THIS.isInteger(x) && x >= -128 && x <= 127;
  };

  THIS.isOctet = function(x){
    return THIS.isInteger(x) && x >= 0 && x <= 255;
  };

  THIS.isShort = function(x){
    return THIS.isInteger(x) && x >= -32768 && x <= 32767;
  };

  THIS.isUnsignedShort = function(x){
    return THIS.isInteger(x) && x >= 0 && x <= 65535;
  };

  THIS.isLong = function(x){
    return THIS.isInteger(x) && x >= -2147483648 && x <= 2147483647;
  };

  THIS.isUnsignedLong = function(x){
    return THIS.isInteger(x) && x >= 0 && x <= 4294967295;
  };

  THIS.isLongLong = function(x){
    return THIS.isInteger(x) && x >= -9223372036854775808 && x <= 9223372036854775807;
  };

  THIS.isUnsignedLongLong = function(x){ //
    return THIS.isInteger(x) && x >= 0 && x <= 18446744073709551615;
  };

  THIS.isAny = function(){
    return true;
  };

  THIS.isFloat = _.isNumber;

  THIS.isString = _.isString;

  THIS.isBoolean = _.isBoolean;

  THIS.isArrayBuffer = function(x){
    return x instanceof ArrayBuffer;
  };

  THIS.isArray = _.isArray;

  THIS.isDate = _.isDate;

  THIS.isObject = _.isObject;

  THIS.isUndefined = _.isUndefined;

	return RPCStub;
});
