define(["NaClModule"], function(NaClModule){

  describe("NaCl Module", function() {
    var testModuleId = "rpc-module";

    // Use this to set up a fake module
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
          fakeEmbed.dispatchEvent(new CustomEvent('load'));
          fakeEmbed.dispatchEvent(new CustomEvent('loadend'));
          fakeEmbed.loaded = true;
        }, ms || 50);
      };

      fakeEmbed.fakeCrash = function(exitStatus, ms){
        //PRE: The module should have already been loaded.
        if(fakeEmbed.loaded){
          setTimeout( function(){
            fakeEmbed.exitStatus = exitStatus == undefined ? -1 : exitStatus;
            fakeEmbed.dispatchEvent(new CustomEvent("crash"));
            fakeEmbed.crashed = true;
          } , ms || 50);
        } else {
          throw new Error("You're trying to fake crash a module that wasn't loaded.");
        }
      };

      fakeEmbed.fakeMessage = function(data, ms){
        //PRE: The module should have already been loaded.
        if(fakeEmbed.loaded){
          setTimeout( function(){
            var e = new CustomEvent("message");
            e.data = data;
            fakeEmbed.dispatchEvent(e);
            fakeEmbed.messageSent = true;
          } , ms || 50);
        } else {
          throw new Error("You're trying to fake message  from a module that wasn't loaded.");
        }
      };

      return fakeEmbed;

    };

    var createModuleWithFakeEmbed = function(){
      var myModule = new NaClModule({src:'rpc-module.nmf', name:'rpc', id:testModuleId,type:'application/x-pnacl'}),
          fakeEmbed = createFakeEmbed();
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

    afterEach(function() {
      // remove the naclmodule after each test.
      listenerElement = document.getElementById(testModuleId+'-listener');
      if(listenerElement){
        listenerElement.parentNode.removeChild(listenerElement);
      }
    });


    it("should construct",function(){
      myModule = new NaClModule({src:'rpc-module.nmf', name:'rpc', id:testModuleId, type:'application/x-pnacl'});
      expect(myModule).toBeDefined();
    });


    it("should fail to construct if we don't give it src, name, id or type", function(){
      var nonGiven = function(){ new NaClModule(); };
      var nonGiven2 = function(){ new NaClModule({}); };
      var rpcmodulegiven = function(){ new NaClModule({src:'rpc-module.nmf'}); };
      var rpcmoduleAndName = function(){ new NaClModule({src:'rpc-module.nmf', name:'rpc1'}); };
      var rpcmoduleNameAndId = function(){ new NaClModule({src:'rpc-module.nmf', name:'rpc2', id:testModuleId}); };
      var rpcmoduleNameAndIdType = function(){ new NaClModule({src:'rpc-module.nmf', name:'rpc3', id:testModuleId,type:'application/x-pnacl'}); };

      expect(nonGiven).toThrow();
      expect(nonGiven2).toThrow();
      expect(rpcmodulegiven).toThrow();
      expect(rpcmoduleAndName).toThrow();
      expect(rpcmoduleNameAndId).toThrow();

      // the only one that works is when they're all filled in.
      expect(rpcmoduleNameAndIdType).not.toThrow();

    });


    it("should fail to construct if the application type isn't valid", function(){
      var notCorrectType = function(){ new NaClModule({src:'rpc-module.nmf', name:'rpc', id:testModuleId,type:'application/x-helloworld'}); };
      expect(notCorrectType).toThrow();
    });


    it("should construct with x-nacl types", function(){
      new NaClModule({src:'rpc-module.nmf', name:'rpc', id:testModuleId,type:'application/x-nacl'});
    });


    it("should construct with x-pnacl types", function(){
      new NaClModule({src:'rpc-module.nmf', name:'rpc', id:testModuleId,type:'application/x-pnacl'});
    });


    it("should fail when a module with the same name already exists", function(){
      var rpcmoduleNameAndIdType = function(){ new NaClModule({src:'rpc-module.nmf', name:'rpc', id:testModuleId,type:'application/x-pnacl'}); };
      // first time should pass
      expect(rpcmoduleNameAndIdType).not.toThrow();

      // second time should fail.
      expect(rpcmoduleNameAndIdType).toThrow();
    });


    it("should load a module and call a callback we specify", function(){
      var myModule = createModuleWithFakeEmbed();

      // we haven't called .load() yet, so the status should be 0.
      expect(myModule.status).toBe(0); // 0 means NO-STATUS

      // we create a callback spy to ensure the callback is called
      var loadCallbackSpy = jasmine.createSpy("loadCallback");

      // idea: load the module and the fakeEmbed will fire the load event.
      myModule.load(loadCallbackSpy);

      // wait for the module to load
      waitsFor(function(){
        return myModule.moduleEl.loaded; // loaded property only exists in test.
      }, "the embed to load", 1000);

      // check callback was called and status changed
      runs(function(){
        expect(loadCallbackSpy).toHaveBeenCalled();
        expect(myModule.status).toBe(1); // 1 means loaded
      });
    });

    it("should allow multiple load callbacks", function(){
      var myModule = createModuleWithFakeEmbed(),
          onload1  = jasmine.createSpy("load1"),
          onload2  = jasmine.createSpy("load2"),
          onload3  = jasmine.createSpy("load3");

      // register onload listeners
      myModule.on("load", onload1);
      myModule.on("load", onload2);
      myModule.on("load", onload3);

      // load the module
      myModule.load();

      waitsFor(function(){
        return myModule.moduleEl.loaded; // loaded property only exists in test.
      }, "the embed to load", 1000);

      // check callbacks were called.
      runs(function(){
        expect(onload1).toHaveBeenCalled();
        expect(onload2).toHaveBeenCalled();
        expect(onload3).toHaveBeenCalled();
      });
    });

    it("should handle messages", function(){
      var myModule = createModuleWithFakeEmbed(),
          onMessageSpy = jasmine.createSpy("onMessage"),
          onMessageSpy2 = jasmine.createSpy("onMessage2"),
          testData = "hello, world! I'm test number "+ (new Date()).getTime();

      myModule.load();
      myModule.on("message", onMessageSpy);
      myModule.on("message", onMessageSpy2);

      waitsFor(function(){
        return myModule.moduleEl.loaded; // loaded property only exists in test.
      }, "the embed to load", 1000);

      runs(function(){
        myModule.moduleEl.fakeMessage(testData);
      });

      waitsFor(function(){
        return myModule.moduleEl.messageSent;
      }, "a message to be sent", 1000);

      runs(function(){
        // Important: set the messageSent param back to false so we could send/receive more messages later.
        myModule.moduleEl.messageSent = false;
        expect(onMessageSpy).toHaveBeenCalledWith(jasmine.objectContaining({data: testData}));
        expect(onMessageSpy2).toHaveBeenCalledWith(jasmine.objectContaining({data: testData}));
      });

    });

    it("should handle a module crash", function(){
      var myModule = createModuleWithFakeEmbed(),
          crashSpy = jasmine.createSpy("crashSpy");

      myModule.load();
      myModule.on("crash", crashSpy);

      waitsFor(function(){
        return myModule.moduleEl.loaded; // loaded property only exists in test.
      }, "the embed to load", 1000);

      runs(function(){
        myModule.moduleEl.fakeCrash();
      });

      waitsFor(function(){
        return myModule.moduleEl.crashed;
      }, "the embed to crash", 1000);

      runs(function(){
        expect(crashSpy).toHaveBeenCalled();
        expect(myModule.status).toBe(2); // 2 means CRASHED
        expect(myModule.exitCode).toBe(-1);
      });
    });

    it("should postMessage to the embed", function(){
      var myModule = createModuleWithFakeEmbed(),
          testData = "Hello! I'm test number "+(new Date()).getTime();

      spyOn(myModule.moduleEl, "postMessage");
      myModule.load();
      waitsFor(function(){
        return myModule.moduleEl.loaded; // loaded property only exists in test.
      }, "the embed to load", 1000);

      runs(function(){
        myModule.postMessage(testData);
        expect(myModule.moduleEl.postMessage).toHaveBeenCalledWith(testData);
      });
    });

    it("shouldn't post the message if the module wasn't loaded", function(){
      var myModule = createModuleWithFakeEmbed();
      spyOn(myModule.moduleEl, "postMessage");
      myModule.postMessage();
      expect(myModule.moduleEl.postMessage).not.toHaveBeenCalled();
    });

  });
});