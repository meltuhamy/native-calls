define(["RPCModule", "loglevel"], function(RPCModule, loglevel){
  // these tests run several different nacl modules, with different tests for each one.
  var TEST_SRC_PREFIX = '/base/test/e2e/';
  var E2E = {
    Fib: TEST_SRC_PREFIX+"Fib/FibRPC.js",
    Complex: TEST_SRC_PREFIX+"Complex/ComplexRPC.js"
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

    it("should do an error callback when finding a negative fib number using throwingFib", function(done){
      var success = function(){
        throw "Success should not have been called.";
      };

      var failure = function(errorObject){
        // the error object below can be seen in Fib.cpp.
        expect(errorObject).toEqual({
          code: -1,
          message: "Can't find negative fib number!"
        });
        done();
      };
      FibModule.Fib.throwingFib(-13, success, failure);
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




  describe("ComplexRPCModule", function(){
    var ComplexModule;
    var getRandom = function(){return Math.random() * 201 - 100};
    beforeEach(function(done){
      require([E2E.Complex], function(ComplexRPCModule){
        ComplexModule = ComplexRPCModule(TEST_SRC_PREFIX);
        RPCModule.getModule(ComplexModule).load(function(){
          done();
        });

        // crash = bad
        RPCModule.getModule(ComplexModule).on("crash", function(){
          if(this.exitCode != 0){
            throw new Error("Module crashed with exit code "+this.exitCode);
          }
        });

      });
    });

    afterEach(function(){
      if(ComplexModule){
        var listenerElement = document.getElementById(RPCModule.getModule(ComplexModule).id);
        if (listenerElement) {

          listenerElement.parentNode.parentNode.removeChild(listenerElement.parentNode);
        }
      }
    });


    it("should add two complex numbers", function(done){
      var complex1 = {real: getRandom(), imaginary: getRandom()};
      var complex2 = {real: getRandom(), imaginary: getRandom()};

      //http://en.wikipedia.org/wiki/Complex_number#Addition_and_subtraction
      var expected = {
        real: complex1.real + complex2.real,
        imaginary: complex1.imaginary + complex2.imaginary
      };

      ComplexModule.Calculator.add(complex1, complex2, function(result){
        expect(result.real).toBeCloseTo(expected.real, 3);
        expect(result.imaginary).toBeCloseTo(expected.imaginary,3);
        done();
      });
    });


    it("should subtract two complex numbers", function(done){
      var complex1 = {real: getRandom(), imaginary: getRandom()};
      var complex2 = {real: getRandom(), imaginary: getRandom()};

      //http://en.wikipedia.org/wiki/Complex_number#Addition_and_subtraction
      var expected = {
        real: complex1.real - complex2.real,
        imaginary: complex1.imaginary - complex2.imaginary
      };

      ComplexModule.Calculator.subtract(complex1, complex2, function(result){
        expect(result.real).toBeCloseTo(expected.real, 3);
        expect(result.imaginary).toBeCloseTo(expected.imaginary,3);
        done();
      });
    });


    it("should multiply two complex numbers", function(done){
      var complex1 = {real: getRandom(), imaginary: getRandom()};
      var complex2 = {real: getRandom(), imaginary: getRandom()};

      //http://en.wikipedia.org/wiki/Complex_number#Multiplication_and_division
      var expected = {
        real: complex1.real * complex2.real - complex1.imaginary * complex2.imaginary,
        imaginary: complex1.imaginary * complex2.real + complex1.real * complex2.imaginary
      };

      ComplexModule.Calculator.multiply(complex1, complex2, function(result){
        expect(result.real).toBeCloseTo(expected.real, 3);
        expect(result.imaginary).toBeCloseTo(expected.imaginary,3);
        done();
      });
    });


    it("should find the sum of an array of complex numbers", function(done){
      // generate array of 100 complex numbers
      var numComplices = 100;
      var complices = [];
      var expected = {real: 0, imaginary: 0};
      for(var i = 0; i < numComplices; i++ ){
        var current = {real: getRandom(), imaginary: getRandom()};
        expected = {real: expected.real + current.real, imaginary: expected.imaginary + current.imaginary};
        complices.push(current);
      }

      ComplexModule.Calculator.sum_all(complices, function(result){
        expect(result.real).toBeCloseTo(expected.real, 3);
        expect(result.imaginary).toBeCloseTo(expected.imaginary,3);
        done();
      });
    });


    it("should find the product of an array of complex numbers", function(done){
      var getRandomNotZero = function(){
        var r = getRandom();
        return r == 0 ? Math.random() + 1 : r;
      };

      var numComplices = 4; // not that much, since we'll lose a lot of precision.
      var complices = [];
      var expected = {real: 1, imaginary: 0}; // == 1.
      for(var i = 0; i < numComplices; i++ ){
        var current = {real: getRandomNotZero(), imaginary: getRandomNotZero()};
        expected = {
          real: expected.real * current.real - expected.imaginary * current.imaginary,
          imaginary: expected.imaginary * current.real + expected.real * current.imaginary
        };
        complices.push(current);
      }

      ComplexModule.Calculator.multiply_all(complices, function(result){
        expect(result.real).toBeCloseTo(expected.real, 3);
        expect(result.imaginary).toBeCloseTo(expected.imaginary,3);
        done();
      });
    });


    it("should map complex numbers to their magnitudes", function(){
      var numComplices = 100; // not that much, since we'll lose a lot of precision.
      var complices = [];
      var expectedResults = [];
      for(var i = 0; i < numComplices; i++ ){
        var current = {real: getRandom(), imaginary: getRandom()};

        //http://en.wikipedia.org/wiki/Complex_number#Absolute_value_and_argument
        expectedResults.push(Math.pow(current.real, 2) + Math.pow(current.imaginary, 2));
        complices.push(current);
      }

      ComplexModule.Calculator.map_abs(complices, function(results){
        for(var i = 0; i < results.length; i++){
          expect(results[i]).toBeCloseTo(expectedResults[i], 3);
        }
        done();
      });

    });

  });

});