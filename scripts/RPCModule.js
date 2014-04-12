define(['RPCStub', 'RPCRuntime', 'JSONRPC', 'RPCTransport', 'lodash'], function(RPCStub, RPCRuntime, JSONRPC, RPCTransport, _){
  /**
   * The RPC module ties everything together. Give it a configuration and it will set everything up.
   * The configuration should include the NaCl module as well as the stub function specs.
   * The result is a bare-bones object with *only* the stub functions as properties.
   * This means you can do myModule.funcName(1,2,callback,error);.
   * @param config
   * @constructor
   */
	function RPCModule(config){
		if(!_.isUndefined(config)){
      // validate everything has been provided
      if(_.isObject(config)){
        if(_.isUndefined(config.module)){
          throw new Error("A NaClModule must be provided");
        }
        return this.constructRPCModule(config.module, config.functions);
      } else {
        throw new Error("The configuration must be an object");
      }
    } else {
      throw new Error("A config must be provided");
    }
	}

  /**
   * This is used to get access to the stub so we can add stub functions things at runtime
   * The key includes spaces and '!' since it is unlikely that a rpc function name would have these characters.
   * @type {string}
   */
  RPCModule.prototype.specialPropertyName = "!  __stub__  !";

  RPCModule.prototype.constructRPCModule = function(module, functionSpecs){
    var transport = new RPCTransport(module),
        jsonRPC = new JSONRPC(transport),
        runtime = new RPCRuntime(jsonRPC),
        stub = new RPCStub(runtime),
        moduleObj = Object.create(null); //blank slate object

    if(_.isArray(functionSpecs)){
      for(var i = 0; i < functionSpecs.length; i++){
        // add a stub for each spec
        var spec = functionSpecs[i];
        if(_.isUndefined(moduleObj[spec.name])){
          moduleObj[spec.name] = stub.constructStub(spec);
        } else {
          throw new Error("Duplicate function spec names found.");
        }
      }
    }

    // we add stub to the module so we can add stub functions later at runtime.
    Object.defineProperty(moduleObj, RPCModule.prototype.specialPropertyName, {
      enumerable: false,
      configurable: false,
      writable: false,
      value: stub
    });

    return moduleObj;
  };

  RPCModule.prototype.addStubToModule = function(rpcModule, functionSpec){
    if(_.isObject(rpcModule) && _.isObject(functionSpec) && _.isString(functionSpec.name) && _.isUndefined(rpcModule[functionSpec.name])){
      rpcModule[functionSpec.name] = rpcModule[RPCModule.prototype.specialPropertyName].constructStub(functionSpec);
    } else {
      throw new Error("Can't add stub to module. The module and function spec need to be defined, and the function must not already be in the module.");
    }
  };

  // for easy access, we allow addStubToModule to be accessed directly
  RPCModule.addStubToModule = RPCModule.prototype.addStubToModule;

  return RPCModule;
});
