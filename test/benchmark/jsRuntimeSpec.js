window.NaClConfig = {
  VALIDATION: false
};
define(['Benchmark', 'NativeCalls'], function (Benchmark, NativeCalls) {
  //todo
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 300000; // 5 minutes
  NativeCalls.loglevel.setLevel("WARN");

  /*
  What we'll test: the full JS library time:
  - How long it takes to go from Module.Interface.foo(cb) to NaClModule.postMessage
  - How long it takes to go from NaClModule.handleMessage to cb.

   We will monkey-patch the library to measure this accurately:
   - NaClModule.postMessage will automatically call cb.
   - Simply resolve deferred once cb is reached.
   - Everything else is a normal RPC call.
   */
  describe('JS Library Time Benchmark', function () {
    var Bench;

    // generate random data
    var randomLong = function (i) {
          var max = 2147483647; // 9007199254740992 == max long
          var min = -2147483648;
          return Math.floor(Math.random() * (max - min + 1)) + min;
        },
        aRandomLong = randomLong(0),

        randomDouble = function (i) {
          var max = 2147483648; // 9007199254740992 == max int
          var min = -2147483648;
          return Math.random() * (max - min) + min;
        },
        aRandomDouble = randomDouble(0),

        randomDOMString = function (i) {
          var str = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quis tincidunt nisi, vitae pulvinar tortor. Duis nisi lacus, adipiscing non varius sed, adipiscing varius nisl. Suspendisse potenti. Curabitur ut interdum libero, sed accumsan lectus. Suspendisse consequat risus sit amet velit auctor, at posuere massa convallis. Donec quis lectus magna. Suspendisse id orci vulputate massa facilisis volutpat. Donec pulvinar hendrerit nunc non tristique. Nullam pretium viverra diam non tempor. Etiam vitae ipsum ipsum. Sed sit amet lacinia risus. Proin pulvinar arcu arcu, vitae mattis ipsum bibendum eu. Integer suscipit dictum dignissim. Aenean eu mauris fringilla, egestas elit vitae, mattis nibh. Nulla facilisi. Maecenas cursus arcu nulla, vel congue enim ullamcorper sed. In rutrum augue vitae ipsum luctus ultrices et id turpis. Vivamus ligula ipsum, bibendum eu malesuada id, commodo nec nibh. Mauris fringilla lectus ac egestas cursus. Curabitur convallis nunc nec lacus consectetur consectetur. Integer fringilla sapien non nunc iaculis, sed semper nisi aliquam. Integer molestie fermentum orci, at pellentesque risus auctor vitae. Nullam non tempor erat. Donec auctor felis et nunc semper, ut blandit libero vehicula. Morbi sit amet purus lacinia sapien placerat aliquam. Curabitur aliquam commodo ipsum sit amet porta.";
          return str.substr(0, 100);
        },
        aRandomDOMString = randomDOMString(0),

        randomDict = function (i) {
          /*
           dictionary dict {
           DOMString str;
           double d;
           boolean b;
           };
           */
          return {
            str: randomDOMString(0),
            d: randomDouble(0),
            b: true
          };
        },
        aRandomDict = randomDict(0),

        randomNestedDict = function (i) {
          /*
           dictionary nestedDict {
           DOMString topStr;
           double topD;
           boolean topB;
           dict nested;
           };
           */
          return {
            topStr: randomDOMString(0),
            topD: randomDouble(0),
            topB: true,
            nested: randomDict(0)
          };
        },
        aRandomNestedDict = randomNestedDict(0);


    // test data
    var testArrays = {
      intervals: [10, 45, 100, 450, 1000, 4500, 10000, 45000, 100000],
      max: 100000
    };
    var intervals = testArrays.intervals;
    for (var i = 0; i < intervals.length; i++) {
      // initialise each part
      testArrays[intervals[i]] = {
        "long": [],
        "double": [],
        "DOMString": [],
        "dict": [],
        "nestedDict": []
      };
    }

    // set up test array data
    for (i = 0; i < testArrays.max; i++) {
      for (var j = 0; j < intervals.length; j++) {
        if (i < intervals[j]) {
          // populate
          testArrays[intervals[j]].long.push(randomLong(i));
          testArrays[intervals[j]].double.push(randomDouble(i));
          testArrays[intervals[j]].DOMString.push(randomDOMString(i));
          testArrays[intervals[j]].dict.push(randomDict(i));
          testArrays[intervals[j]].nestedDict.push(randomNestedDict(i));
        }
      }
    }

    beforeEach(function (done) {
      console.log("[JS LIBRARY TIME BENCHMARK]");
      // delete module if exists
      var moduleExists = false;
      var listenerElement = document.getElementById("Bench-listener");
      if (listenerElement) {
        listenerElement.parentNode.removeChild(listenerElement);
      }

      require(['/base/test/benchmark/Bench/BenchRPC.js'], function (BenchRPC) {
        Bench = BenchRPC('/base/test/benchmark/');
        NativeCalls.loglevel.disableAll();
        // monkey patch the module
        var benchNaClModule = NativeCalls.RPCModule.getModule(Bench);
        var benchStub = NativeCalls.RPCModule.getStub(Bench);
        var transport = benchStub.runtime.jsonRPC.transport;
        benchNaClModule.postMessage = function(data){
          transport.handleMessage({data:{"jsonrpc": "2.0", "result": data.params[0], "id": data.id}});
        }; // this makes it entirely synchronous.

        benchNaClModule.load(done);
      });

    });


    it("runs the benchmark for long type", function(done){
      Bench.Benchmark.printSeperator(" BEGIN long BENCHMARK ", function(){
        var suite = new Benchmark.Suite;
        suite.add('long', {
          fn: function () {
            Bench.Benchmark.bench_long(aRandomLong);
          }
        }).on('cycle', function (event) {
          console.log(String(event.target));
        }).on('complete', done).run();

      });
    });


    it("runs the benchmark for double type", function(done){
      Bench.Benchmark.printSeperator(" BEGIN double BENCHMARK ", function(){
        var suite = new Benchmark.Suite;

        suite.add('double', {
          fn: function (deferred) {
            Bench.Benchmark.bench_double(aRandomDouble);
          }
        }).on('cycle', function (event) {
          console.log(String(event.target));
        }).on('complete', done).run();
      });
    });

    it("runs the benchmark for DOMString type", function(done){
      Bench.Benchmark.printSeperator(" BEGIN DOMString BENCHMARK ", function(){
        var suite = new Benchmark.Suite;
        suite.add('DOMString', {
          fn: function () {
            Bench.Benchmark.bench_DOMString(aRandomDOMString);
          }
        }).on('cycle', function (event) {
          console.log(String(event.target));
        }).on('complete', done).run();
      });
    });


    it("runs the benchmark for dict type", function(done){
      Bench.Benchmark.printSeperator(" BEGIN dict BENCHMARK ", function(){
        var suite = new Benchmark.Suite;
        suite.add('dict', {
          fn: function () {
            Bench.Benchmark.bench_dict(aRandomDict);
          }
        }).on('cycle', function (event) {
          console.log(String(event.target));
        }).on('complete', done).run();
      });
    });

    it("runs the benchmark for nestedDict type", function(done){
      Bench.Benchmark.printSeperator(" BEGIN nestedDict BENCHMARK ", function(){
        var suite = new Benchmark.Suite;
        suite.add('nestedDict', {
          fn: function () {
            Bench.Benchmark.bench_nestedDict(aRandomNestedDict);
          }
        }).on('cycle', function (event) {
          console.log(String(event.target));
        }).on('complete', done).run();
      });
    });

    for(i = 0; i < intervals.length; i++){
      var len = intervals[i];
      //long
      (function(len){
        var benchName = "sequence<long>#"+len;
        it("runs the benchmark for "+benchName+" type", function(done){
          Bench.Benchmark.printSeperator(" BEGIN "+benchName+" BENCHMARK ", function(){
            var suite = new Benchmark.Suite;
            suite.add(benchName, {
              fn: function () {
                Bench.Benchmark.bench_seq_long(testArrays[len].long);
              }
            }).on('cycle', function (event) {
              console.log(String(event.target));
            }).on('complete', done).run();
          });
        });
      })(len);

      //double
      (function(len){
        var benchName = "sequence<double>#"+len;
        it("runs the benchmark for "+benchName+" type", function(done){
          Bench.Benchmark.printSeperator(" BEGIN "+benchName+" BENCHMARK ", function(){
            var suite = new Benchmark.Suite;
            suite.add(benchName, {
              fn: function () {
                Bench.Benchmark.bench_seq_double(testArrays[len].double);
              }
            }).on('cycle', function (event) {
              console.log(String(event.target));
            }).on('complete', done).run();
          });
        });
      })(len);

      //DOMString
      (function(len){
        var benchName = "sequence<DOMString>#"+len;
        it("runs the benchmark for "+benchName+" type", function(done){
          Bench.Benchmark.printSeperator(" BEGIN "+benchName+" BENCHMARK ", function(){
            var suite = new Benchmark.Suite;
            suite.add(benchName, {
              fn: function () {
                Bench.Benchmark.bench_seq_DOMString(testArrays[len].DOMString);
              }
            }).on('cycle', function (event) {
              console.log(String(event.target));
            }).on('complete', done).run();
          });
        });
      })(len);

      //dict
      (function(len){
        var benchName = "sequence<dict>#"+len;
        it("runs the benchmark for "+benchName+" type", function(done){
          Bench.Benchmark.printSeperator(" BEGIN "+benchName+" BENCHMARK ", function(){
            var suite = new Benchmark.Suite;
            suite.add(benchName, {
              fn: function () {
                Bench.Benchmark.bench_seq_dict(testArrays[len].dict);
              }
            }).on('cycle', function (event) {
              console.log(String(event.target));
            }).on('complete', done).run();
          });
        });
      })(len);

      //nestedDict
      (function(len){
        var benchName = "sequence<nestedDict>#"+len;
        it("runs the benchmark for "+benchName+" type", function(done){
          Bench.Benchmark.printSeperator(" BEGIN "+benchName+" BENCHMARK ", function(){
            var suite = new Benchmark.Suite;
            suite.add(benchName, {
              fn: function () {
                Bench.Benchmark.bench_seq_nestedDict(testArrays[len].nestedDict);
              }
            }).on('cycle', function (event) {
              console.log(String(event.target));
            }).on('complete', done).run();
          });
        });
      })(len);
    }

  });


});
