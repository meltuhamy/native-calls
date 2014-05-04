define(['lodash', 'TagLogger', 'NaClConfig'], function(_, TagLogger, NaClConfig){
  /**
   * Creates a NaCl module wrapper that encapsulates the embed element.
   * @param attrs - The attributes to add to the embed element
   * @constructor
   */
  function NaClModule(attrs){
    this.logger = new TagLogger(); //used for logging
    // Used in closures
    var thisModule = this;
    // Make sure that attrs includes name, src, and id.
    if( _.isUndefined(attrs) || 
        _.isUndefined(attrs.name)){
      throw new Error("Could not create NaCl Module. name must be defined");
    }

    // config or src/type must be defined
    if( (_.isUndefined(NaClConfig.CONFIG) || _.isUndefined(NaClConfig.TOOLCHAIN)) && (_.isUndefined(attrs.src) || _.isUndefined(attrs.type))){
      throw new Error("Could not infer type from config. TOOLCHAIN and CONFIG must be defined; otherwise, use src and type");
    }

    // attrs overrides config
    var moduleName = attrs.name, moduleType = attrs.type, moduleSrc = attrs.src, moduleId = attrs.id;

    // ... otherwise, infer attrs using config
    // infer type
    if(!moduleType){
      if(NaClConfig.TOOLCHAIN === 'pnacl'){
        moduleType = 'application/x-pnacl';
      } else {
        moduleType = 'application/x-nacl';
      }
    }

    // infer src
    if(!moduleSrc){
      // e.g. Logger/pnacl/Release/Logger.nmf
      moduleSrc = (_.isString(attrs.srcPrefix) ? attrs.srcPrefix : '') + moduleName+'/'+NaClConfig.TOOLCHAIN+'/'+NaClConfig.CONFIG+'/'+moduleName+'.nmf';
    }

    // infer id
    if(!moduleId){
      moduleId = moduleName;
    }

    // set the inferred types back to attrs.
    this.type = attrs.type = moduleType;
    this.src = attrs.src = moduleSrc;
    this.id = attrs.id = moduleId;

    this.name = attrs.name;

    // Make sure a module with that id doesn't already exist.
    if(!_.isNull(document.getElementById(attrs.id))){
      throw new Error("A module with that id ("+attrs.id+") already exists.");
    } else if (!_.isNull(document.getElementById(attrs.id+"-listener"))){
      throw new Error("A module with that id ("+attrs.id+") already exists but is not yet loaded.");
    }

    // Make sure the type is correct
    var allowedTypes = ['application/x-nacl','application/x-pnacl'];
    if(!_.contains(allowedTypes, attrs.type)){
      throw new Error("The application type must be one of "+JSON.stringify(allowedTypes));
    }

    // Default width and height is 0. Default parent container is body.

    _.defaults(attrs, {width:"0", height:"0", parent: document.body});

    // wrap the module in a div so we can listen to events before it loads.
    var listenerDiv = document.createElement('div');
        listenerDiv.setAttribute('id', attrs.id + '-listener');

    // append the listener to the parent.
    if(!_.isElement(attrs.parent) && _.isString(attrs.parent) && !_.isEmpty(attrs.parent)){
      // Assume they passed in an ID.
      attrs.parent = document.getElementById(attrs.parent);
    }
    attrs.parent.appendChild(listenerDiv);

    // set up the event listeners.
    listenerDiv.addEventListener("load"    , function(e){
      thisModule.status = STATUSES.LOADED;
      onLoad.call(thisModule,e);
    }, true);
    listenerDiv.addEventListener("message" , function(e){
      onMessage.call(thisModule,e);
    }, true);
    listenerDiv.addEventListener("crash"   , function(e){
      thisModule.status = STATUSES.CRASHED;
      thisModule.exitCode = thisModule.moduleEl.exitStatus;

      onCrash.call(thisModule,e);
    }, true);
    this.listenerDiv = listenerDiv; //expose to object


    // Create the module <embed /> element.    
    var moduleEl = document.createElement('embed');
    _.forOwn(attrs, function(value, attr){
      if(_.isString(value)){
        moduleEl.setAttribute(attr, value);
      }
    });
    this.moduleEl = moduleEl; //expose to object
    this.logger.setTag("NaClModule:"+this.name);
    this.logger.trace("Constructed");

  }

  /**
   * The statuses a NaCl Module can take.
   * @type {{NOSTATUS: number, LOADED: number, CRASHED: number}}
   */
  var STATUSES = {NOSTATUS:0, LOADED: 1, CRASHED: 2};
  NaClModule.prototype.status = STATUSES.NOSTATUS;


  /**
   * Loads the NaCl module by appending it to the listener (which should be on the page by now).
   * @param {Function} [cb]
   * @param thisArg What 'this' will be in the callback. Defualt: The module
   */
  NaClModule.prototype.load = function(cb, thisArg) {
    // Loads the module, then executes the callback.
    // append <embed> to the listener div.
    var thisRef = _.isUndefined(thisArg) ? this : thisArg;
    this.on('load', function(e){
      if(_.isFunction(cb)){
        cb.call(thisRef, e);
      }
      this.listenerDiv.removeEventListener('load', arguments.callee, true);
    });
    this.logger.info("Loading module...");
    this.listenerDiv.appendChild(this.moduleEl);

  };

  // onLoad, onMessage, and onCrash need to be called via Function.prototype.call
  // this ensures they are private.

  /**
   * This is called first when the module is loaded.
   * @param {DocumentEvent} e
   */
  var onLoad = function(e) {
    this.logger.info("Module loaded");
  };

  /**
   * This is called when the module received a message.
   * @param {DocumentEvent} e
   */
  var onMessage = function(e) {
    this.logger.debug("← "+ JSON.stringify(e.data));
  };

  /**
   * This is called if/when the module crashes.
   * @param {DocumentEvent} e
   */
  var onCrash = function(e) {
    this.logger.warn("Module crashed/exited");
  };

  /**
   * Adds event listener to the NaCl Module.
   * @param {string} eventName
   * @param {Function} cb
   * @param thisArg What 'this' will be in the callback. Default: the module
   */
  NaClModule.prototype.on = function(eventName, cb, thisArg) {
    var thisModule = this;
    var thisRef = _.isUndefined(thisArg) ? thisModule : thisArg;

    thisModule.listenerDiv.addEventListener(eventName, function(e){
      // wrap it around in case we want to do something first.
      // now call the callback, in the context of this module.
      if(_.isFunction(cb)){
        cb.call(thisRef,e);
      }
    }, true);
  };

  /**
   * Send a message to the NaCl module
   * @param {Object} data
   */
  NaClModule.prototype.postMessage = function(data) {
    if(this.status === STATUSES.LOADED){
      this.moduleEl.postMessage(data);
      this.logger.debug("→ "+JSON.stringify(data));
    } else {
      this.logger.error("postMessage failed. Module not running.");
    }
  };

  return NaClModule; // module export
});
