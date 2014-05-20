

define(["NaClModule"], function(NaClModule){
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;
  describe("C++ Testing Framework", function() {
    var testingModule;
    var moduleExists = false;

    var moduleLocation = 'test/cpp/pnacl/Release/testing.nmf',
        moduleURL = '/base/'+moduleLocation;

    beforeEach(function(done) {
      jasmine.Expectation.addMatchers({
        toFail: function(){
          return {
            compare: function(actual){
              return {
                pass: false,
                message: "FAIL: "+ actual
              }
            }
          }
        }
      });
      // instead of stupidly loading the module, we actually check if it exists first.
      var r = new XMLHttpRequest();
      r.open("GET", moduleURL, true);
      r.onreadystatechange = function () {
        if(r.readyState == 4){
          // check the status
          if(r.status != 200){
            moduleExists = false;
            console.error("MODULE LOAD ERROR");
            done();
          } else {
            moduleExists = true;
            done();
          }
        }
      };
      r.send();
    });

    it("shouldn't fail any C++ tests", function(done){
      expect(moduleExists).toBe(true);
      if(moduleExists){
        testingModule = new NaClModule({
          name: "testingModule",
          src: moduleURL,
          id: "testingModule",
          type: "application/x-pnacl"
        });

        testingModule.on("crash", function(progressEvent){
          if(this.exitCode != 0){
            throw new Error("Module Crashed with exit code "+this.exitCode);
          } else {
            console.log("NaClModule Exited with code "+this.exitCode);
          }
          done();
        });

        var testingFramework = {
          startCommand: function(testName) {
          },

          failCommand: function(fileName, lineNumber, summary) {
            throw (fileName + ":" + lineNumber + ": " + summary);
          },

          endCommand: function(testName, testResult) {
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
        testingModule.load();
      } else {
        done();
      }

    });
  });
});
