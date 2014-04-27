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
        return RPCModule.constructRPCModule(config.module, config.dictionaries, config.interfaces);
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
  RPCModule.specialPropertyName = "!  __stub__  !";

  RPCModule.constructRPCModule = function(module, dictionaryDefinitions, interfaceDefinitions){
    var transport = new RPCTransport(module),
        jsonRPC = new JSONRPC(transport),
        runtime = new RPCRuntime(jsonRPC),
        stub = new RPCStub(runtime),
        moduleObj = Object.create(null), //will hold interfaces. idea: myModule.myInterface.myFoo();
        i; //for iterating

    if(_.isArray(dictionaryDefinitions)){
      // first, add the dictionary definitions.
      for(i=0; i < dictionaryDefinitions.length; i++){
        stub.addDictionary(dictionaryDefinitions[i]);
      }
    }

    if(_.isArray(interfaceDefinitions)){
      // we create a property for each interface.
      for(i = 0; i < interfaceDefinitions.length; i++){
        var currentInterface = interfaceDefinitions[i];
        if(_.isUndefined(moduleObj[currentInterface.name])){
          moduleObj[currentInterface.name] = stub.addInterface(currentInterface).toMap();
        } else {
          throw new Error("Can't create a module with duplicate interfaces.");
        }
      }
    }

    // we add stub to the module so we can add stub functions later at runtime.
    Object.defineProperty(moduleObj, RPCModule.specialPropertyName, {
      enumerable: false,
      configurable: false,
      writable: false,
      value: stub
    });

    return moduleObj;
  };

  RPCModule.getStub = function(rpcModule){
    return rpcModule[RPCModule.specialPropertyName];
  };

  RPCModule.getModule = function(rpcModule){
    return RPCModule.getStub(rpcModule).getModule();
  };

  return RPCModule;
});
