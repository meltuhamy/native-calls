define(['lodash'], function(_){
  function NaClModule(attrs){
    // Used in closures
    thisModule = this;
    // Make sure that attrs includes name, src, and id.
    if( _.isUndefined(attrs) || 
        _.isUndefined(attrs.name) || 
        _.isUndefined(attrs.src) || 
        _.isUndefined(attrs.id) || 
        _.isUndefined(attrs.type)){
      throw new Error("Could not create NaCl Module. name, src, type, and id must be defined");
      return;
    }

    this.name = attrs.name;

    // Make sure a module with that id doesn't already exist.
    if(!_.isNull(document.getElementById(attrs.id))){
      throw new Error("A module with that id ("+attrs.id+") already exists.");
      return;
    } else if (!_.isNull(document.getElementById(attrs.id+"-listener"))){
      throw new Error("A module with that id ("+attrs.id+") already exists but is not yet loaded.");
      return;
    }

    // Make sure the type is correct
    var allowedTypes = ['application/x-nacl','application/x-pnacl'];
    if(!_.contains(allowedTypes, attrs.type)){
      throw new Error("The application type must be one of "+JSON.stringify(allowedTypes));
      return;
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



  };
  STATUSES = {NOSTATUS:0, LOADED: 1, CRASHED: 2};
  NaClModule.prototype.status = STATUSES.NOSTATUS;

  NaClModule.prototype.load = function(cb) {
    // Loads the module, then executes the callback.
    // append <embed> to the listener div.
    this.on('load', function(e){
      if(_.isFunction(cb)){
        cb.call(this, e);
      }
      this.listenerDiv.removeEventListener('load', arguments.callee, true);
    });

    this.listenerDiv.appendChild(this.moduleEl);

  };

  // onLoad, onMessage, and onCrash need to be called via Function.prototype.call
  // this ensures they are private.
  var onLoad = function(e) {
    console.info("["+ this.name + "]" + " module loaded");
  };

  var onMessage = function(e) {
    console.info("["+ this.name + "]" + " message received");
    
  };

  var onCrash = function(e) {
    console.error("["+ this.name + "]" + " module crashed");
  };
  
  NaClModule.prototype.on = function(eventName, cb) {
    thisModule = this;
    thisModule.listenerDiv.addEventListener(eventName, function(e){
      // wrap it around in case we want to do something first.
      // now call the callback, in the context of this module.
      if(_.isFunction(cb)){
        cb.call(thisModule,e);
      }
    }, true);
  };

  NaClModule.prototype.postMessage = function(data) {
    if(this.status === STATUSES.loaded){
      this.moduleEl.postMessage(data);      
    } else {
      console.error("["+ this.name + "]" + " postMessage failed. Module not running.");
    }
  };

  return NaClModule; // module export
});