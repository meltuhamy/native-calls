define(["RPCModule", "loglevel"], function(RPCModule, loglevel){
  // these tests run several different nacl modules, with different tests for each one.
  var TEST_SRC_PREFIX = '/base/test/e2e/';
  var E2E = {
    Fib: TEST_SRC_PREFIX+"Fib/FibRPC.js"
  };

  describe("FibRPCModule", function(){
    var FibModule;
    beforeEach(function(done){
      require([E2E.Fib], function(FibRPCModule){
        FibModule = FibRPCModule(TEST_SRC_PREFIX);
        RPCModule.getModule(FibModule).load(function(){
          done();
        });

        // crash = bad
        RPCModule.getModule(FibModule).on("crash", function(){
          if(this.exitCode != 0){
            throw new Error("Module crashed with exit code "+this.exitCode);
          }
        });

      });
    });

    afterEach(function(){
      if(FibModule){
        var listenerElement = document.getElementById(RPCModule.getModule(FibModule).id);
        if (listenerElement) {

          listenerElement.parentNode.parentNode.removeChild(listenerElement.parentNode);
        }
      }
    });

    it("should correctly calculate the nth fib number", function(done){
      var n = 7;
      var expected = (function fibjs(v){ return v<2 ? v : fibjs(v-1) + fibjs(v-2); })(n);
      FibModule.Fib.fib(n, function(result){
        expect(result).toBe(expected);
        done();
      });
    });


    it("should increment a counter", function(done){
      // four counts
      FibModule.Fib.countUp(function(){
        FibModule.Fib.countUp(function(){
          FibModule.Fib.countUp(function(){
            FibModule.Fib.countUp(function(result){
              expect(result).toBe(3); //starting at 0
              done();
            })
          })
        });
      });

    });

  });


});