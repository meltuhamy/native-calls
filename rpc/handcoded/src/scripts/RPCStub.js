define(['RPCRuntime', 'lodash'], function(RPCRuntime, _){
	function RPCStub(rpcRuntime){
    // a stub requires a runtime
    if(_.isUndefined(rpcRuntime)){
      throw new Error("RPCStub needs a runtime");
    } else {
      this.runtime = rpcRuntime;
    }
	}


  RPCStub.prototype.constructStub = function(stubSpec){
    // the stub spec could have a params or returnType properties or both
    if(_.isObject(stubSpec) && _.isString(stubSpec.name)){
      var checkParams, checkReturn, stubThis = this, numParams;

      if(_.isArray(stubSpec.params)){
        numParams = stubSpec.params.length;

        // sort out parameter checking
        checkParams = function(argumentsArray){
          if(stubSpec.params.length !== argumentsArray.length){
            throw new Error("Number of arguments ("+argumentsArray.length+") doesn't match spec ("+stubSpec.params.length+").")
          }
          for(var i = 0; i < argumentsArray.length; i++){
            var expectedType = stubSpec.params[i];
            var argumentIn = argumentsArray[i];
            if(!stubThis.checkType(argumentIn, expectedType)){
              throw new Error("Param "+argumentIn+" is not of expected type "+expectedType);
            }
          }
        };

      } else {
        numParams = 0;
      }

      if(_.isString(stubSpec.returnType)){
        // sort out return type
        checkReturn = function(result){
          return stubThis.checkType(result, stubSpec.returnType);
        };
      }

      // finally, construct the actual function
      return function(){
        // turn the arguments into an array
        var args = Array.prototype.slice.call(arguments, 0);

        // the expected number of parameters is known, numParams.
        // if the user gives more params, then these are probably callbacks.

        // we extract the callbacks
        var userSuccessCallback, userErrorCallback, userParams;
        if(args.length > numParams){
          userSuccessCallback = args[numParams];
          userErrorCallback   = args[numParams+1];
        }

        // we extract the user given parameters
        userParams = args.slice(0,numParams);

        // we check the parameters are correct type
        checkParams(userParams);

        // finally, we call the rpc runtime
        return stubThis.runtime.sendRequest(stubSpec.name, userParams, function(result){
          // we do an extra step of checking the result
          if(checkReturn(result)){
            // success.
            if(_.isFunction(userSuccessCallback)){
              userSuccessCallback.call(null, result);
            }
          } else {
            // failure. incorrect type
            if(_.isFunction(userErrorCallback)){
              userErrorCallback.call(null, {"code" : -32000,
                                            "message" : "returned result is not of correct type",
                                            "data": "Expected "+stubSpec.returnType+", received "+result});
            }
          }

        }, userErrorCallback);


      }
    } else {
      throw new Error("The stub spec needs to be an object with a name property.");
    }
  };


  // Type checking functions
  RPCStub.prototype.isInteger = function(x){
    return _.isNumber(x) && x === (x|0)
  };

  RPCStub.prototype.isFloat = _.isNumber;

  RPCStub.prototype.isString = _.isString;

  RPCStub.prototype.isChar = function(x){
    return _.isString(x) && x.length === 1;
  };

  RPCStub.prototype.isBoolean = _.isBoolean;

  RPCStub.prototype.isArrayBuffer = function(x){
    return x instanceof ArrayBuffer;
  };

  RPCStub.prototype.isArray = _.isArray;

  RPCStub.prototype.checkType = function(x, type){
    if(type === "Any"){
      return true;
    } else {
      return this["is"+type](x);
    }
  };



	return RPCStub;
});
