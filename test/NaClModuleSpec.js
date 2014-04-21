define(["NaClModule", "fakemodule"], function (NaClModule, fakemodule) {

  describe("NaCl Module", function () {
    var testModuleId = "rpc-module";
    var myModuleAttrs = {src: 'rpc-module.nmf', name: 'rpc', id: testModuleId, type: 'application/x-pnacl'};


    beforeEach(function () {
      // remove the naclmodule after each test.
      var listenerElement = document.getElementById(testModuleId + '-listener');
      if (listenerElement) {
        listenerElement.parentNode.removeChild(listenerElement);
      }
    });



    it("should construct", function () {
      var myModule = new NaClModule({src: 'rpc-module.nmf', name: 'rpc', id: testModuleId, type: 'application/x-pnacl'});
      expect(myModule).toBeDefined();
    });



    it("should construct if we only give it a name", function () {
      expect(function () {
        new NaClModule({'name': testModuleId});
      }).not.toThrow();
    });



    it("should fail to construct if we don't give it a name", function () {
      expect(function () {
        new NaClModule(testModuleId);
      }).toThrow;
    });



    it("should infer type, src, and id using the name", function () {
      var myModule = new NaClModule({"name": testModuleId});
      expect(myModule.moduleEl.name).toBeDefined();
      expect(myModule.moduleEl.src).toBeDefined();
      expect(myModule.moduleEl.id).toBeDefined();
      expect(myModule.moduleEl.type).toBeDefined();
    });



    it("should fail to construct if the application type isn't valid", function () {
      var notCorrectType = function () {
        new NaClModule({src: 'rpc-module.nmf', name: 'rpc', id: testModuleId, type: 'application/x-helloworld'});
      };
      expect(notCorrectType).toThrow();
    });



    it("should construct with x-nacl types", function () {
      new NaClModule({src: 'rpc-module.nmf', name: 'rpc', id: testModuleId, type: 'application/x-nacl'});
    });



    it("should construct with x-pnacl types", function () {
      new NaClModule({src: 'rpc-module.nmf', name: 'rpc', id: testModuleId, type: 'application/x-pnacl'});
    });



    it("should fail when a module with the same name already exists", function () {
      var rpcmoduleNameAndIdType = function () {
        new NaClModule({src: 'rpc-module.nmf', name: 'rpc', id: testModuleId, type: 'application/x-pnacl'});
      };
      // first time should pass
      expect(rpcmoduleNameAndIdType).not.toThrow();

      // second time should fail.
      expect(rpcmoduleNameAndIdType).toThrow();
    });



    it("should load a module and call a callback we specify", function (done) {
      var myModule = fakemodule.createModuleWithFakeEmbed(new NaClModule(myModuleAttrs));

      // we haven't called .load() yet, so the status should be 0.
      expect(myModule.status).toBe(0); // 0 means NO-STATUS

      // idea: load the module and the fakeEmbed will fire the load event.
      myModule.load(function () {
        expect(myModule.status).toBe(1); // 1 means loaded
        done();
      });
    });



    it("should allow multiple load callbacks", function (done) {
      var myModule = fakemodule.createModuleWithFakeEmbed(new NaClModule(myModuleAttrs)),
          onload1 = jasmine.createSpy("load1"),
          onload2 = jasmine.createSpy("load2"),
          onload3 = jasmine.createSpy("load3");

      // register onload listeners
      myModule.on("load", onload1);
      myModule.on("load", onload2);
      myModule.on("load", onload3);

      // load the module
      myModule.load(function () {
        expect(onload1).toHaveBeenCalled();
        expect(onload2).toHaveBeenCalled();
        expect(onload3).toHaveBeenCalled();
        done();
      });

    });



    it("should handle messages", function (done) {
      var myModule = fakemodule.createModuleWithFakeEmbed(new NaClModule(myModuleAttrs)),
          onMessageSpy = jasmine.createSpy("onMessage"),
          onMessageSpy2 = jasmine.createSpy("onMessage2"),
          testData = "hello, world! I'm test number " + (new Date()).getTime();

      myModule.on("message", onMessageSpy);
      myModule.on("message", onMessageSpy2);

      myModule.load(function () {
        // send the message
        myModule.moduleEl.fakeMessage(testData, function () {
          // expectations
          expect(onMessageSpy).toHaveBeenCalledWith(jasmine.objectContaining({data: testData}));
          expect(onMessageSpy2).toHaveBeenCalledWith(jasmine.objectContaining({data: testData}));

          done();

        });

      });

    });



    it("should handle a module crash", function (done) {
      var myModule = fakemodule.createModuleWithFakeEmbed(new NaClModule(myModuleAttrs)),
          crashSpy = jasmine.createSpy("crashSpy");

      myModule.on("crash", crashSpy);

      myModule.load(function () {
        myModule.moduleEl.fakeCrash(-1, function () {
          expect(crashSpy).toHaveBeenCalled();
          expect(myModule.status).toBe(2); // 2 means CRASHED
          expect(myModule.exitCode).toBe(-1);
          done();
        });
      });
    });



    it("should handle events with thisReference", function (done) {
      // two ways to do events: .load(fn) and .on(e, fn). We test adding a this reference to each of these.
      var myModule = fakemodule.createModuleWithFakeEmbed(new NaClModule(myModuleAttrs));
      var myObject = {};
      var crazyFunctionName = "aMadeUpFunctionName" + (new Date()).getTime();
      myObject[crazyFunctionName] = jasmine.createSpy("crazySpy1");
      myObject[crazyFunctionName + "2"] = jasmine.createSpy("crazySpy2");

      myModule.on("load", function () {
        this[crazyFunctionName + "2"]();
      }, myObject);

      myModule.on("load", function () {
        this[crazyFunctionName]();
      }, myObject);

      myModule.load(function () {
        expect(myObject[crazyFunctionName]).toHaveBeenCalled();
        expect(myObject[crazyFunctionName + "2"]).toHaveBeenCalled();
        done();
      }, myObject);

    });



    it("should postMessage to the embed", function (done) {
      var myModule = fakemodule.createModuleWithFakeEmbed(new NaClModule(myModuleAttrs)),
          testData = "Hello! I'm test number " + (new Date()).getTime();

      spyOn(myModule.moduleEl, "postMessage");
      myModule.load(function () {
        myModule.postMessage(testData);
        expect(myModule.moduleEl.postMessage).toHaveBeenCalledWith(testData);
        done();
      });
    });



    it("shouldn't post the message if the module wasn't loaded", function () {
      var myModule = fakemodule.createModuleWithFakeEmbed(new NaClModule(myModuleAttrs));
      spyOn(myModule.moduleEl, "postMessage");
      myModule.postMessage();
      expect(myModule.moduleEl.postMessage).not.toHaveBeenCalled();
    });



  });
});