define([],function(){
  // Use this to set up a fake module
  var defaultEventTime = 5; //ms
  var defaultLoadTime = 0; //ms
  var createFakeEmbed = function(){
    var fakeEmbed = document.createElement("embed");
    fakeEmbed.loaded = false;
    fakeEmbed.messageSent = false;
    fakeEmbed.crashed = false;

    // embeds don't normally have a postMessage function. We fake it here.
    fakeEmbed.postMessage = function(){};

    fakeEmbed.fakeLoad = function(ms){
      setTimeout(function(){
        // fake the load event
        fakeEmbed.readyState = 1;
        fakeEmbed.dispatchEvent(new CustomEvent('loadstart'));
        fakeEmbed.readyState = 4;
        fakeEmbed.loaded = true;

        fakeEmbed.dispatchEvent(new CustomEvent('load'));
        fakeEmbed.dispatchEvent(new CustomEvent('loadend'));
      }, ms || defaultLoadTime);
    };

    fakeEmbed.fakeCrash = function(exitStatus, callback, ms){
      //PRE: The module should have already been loaded.
      if(fakeEmbed.loaded){
        setTimeout( function(){
          fakeEmbed.exitStatus = exitStatus == undefined ? -1 : exitStatus;
          fakeEmbed.dispatchEvent(new CustomEvent("crash"));
          fakeEmbed.crashed = true;
          if(callback){
            setTimeout(callback, 0); //push callback to the end of our stack.
          }
        } , ms || defaultEventTime);
      } else {
        throw new Error("You're trying to fake crash a module that wasn't loaded.");
      }
    };

    fakeEmbed.fakeMessage = function(data, callback, ms){
      //PRE: The module should have already been loaded.
      if(fakeEmbed.loaded){
        setTimeout( function(){
          var e = new CustomEvent("message");
          e.data = data;
          fakeEmbed.dispatchEvent(e);
          fakeEmbed.messageSent = true;
          if(callback){
            setTimeout(callback, 0);
          }
        } , ms || defaultEventTime);
      } else {
        throw new Error("You're trying to fake message  from a module that wasn't loaded.");
      }
    };

    return fakeEmbed;

  };

  var createModuleWithFakeEmbed = function(myModule){
    var fakeEmbed = createFakeEmbed();
    myModule.originalEmbed = myModule.moduleEl;
    myModule.moduleEl = fakeEmbed;

    // hack load so that it does a fake embed load
    var normalLoad = myModule.load;
    myModule.load = function(){
      normalLoad.apply(myModule, arguments);
      myModule.moduleEl.fakeLoad();
    };
    return myModule;
  };

  return {createFakeEmbed: createFakeEmbed, createModuleWithFakeEmbed: createModuleWithFakeEmbed};
});