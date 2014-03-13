define(["NaClModule"], function(NaClModule){

  describe("C++ Testing Framework", function() {
    it("shouldn't fail any C++ tests", function(){
      var testingModule = new NaClModule({
        name: "testingModule",
        src: "/base/test/cpp/testing.nmf",
        id: "testingModule",
        type: "application/x-pnacl"
      });

      var testingFramework = {
        startCommand: function(testName) {
//          console.info(testName + " STARTED");
        },

        failCommand: function(fileName, lineNumber, summary) {
          expect(function(){
            throw (fileName + ":" + lineNumber + ": " + summary);
          }).not.toThrow();
        },

        endCommand: function(testName, testResult) {
          console.info(testName + ": "+ testResult.toUpperCase());
        }
      };

      var testingModuleLoaded = false;

      testingModule.on("message", function(event){
        var msg = event.data;
        var firstColon = msg.indexOf(':');
        var cmd = msg.substr(0, firstColon);
        var cmdFunctionName = cmd + 'Command';
        var cmdFunction = testingFramework[cmdFunctionName];

        if (typeof(cmdFunction) !== 'function') {
          console.error('Unknown command: ' + cmd);
          console.error('  message: ' + msg);
          return;
        }

        var argCount = cmdFunction.length;

        // Don't use split, because it will split all commas (for example any commas
        // in the test failure summary).
        var argList = msg.substr(firstColon + 1);
        var args = [];
        for (var i = 0; i < argCount - 1; ++i) {
          var arg;
          var comma = argList.indexOf(',');
          if (comma === -1) {
            if (i !== argCount - 1) {
              console.errror('Bad arg count to command "' + cmd + '", expected ' +
                  argCount);
              console.error('  message: ' + msg);
            } else {
              arg = argList;
            }
          } else {
            arg = argList.substr(0, comma);
            argList = argList.substr(comma + 1);
          }
          args.push(arg);
        }

        // Last argument is the rest of the message.
        args.push(argList);

        cmdFunction.apply(null, args);

      });

      testingModule.load(function(){
        testingModuleLoaded = true;
      });

      waitsFor(function(){
        return testingModuleLoaded
      }, "the testing module to load", 10000);

      runs(function(){
        expect(testingModuleLoaded).toBe(true);
      });
    });
  });
});