describe("OnigScanner", function() {
  describe("::findNextMatch", function() {
    var matchCallback;
    matchCallback = null;
    beforeEach(function() {
      return matchCallback = jasmine.createSpy('matchCallback');
    });


    it("returns the index of the matching pattern", function() {
      var scanner;
      scanner = new OnigScanner(["a", "b", "c"]);
      scanner.findNextMatch("x", 0, matchCallback);
      waitsFor(function() {
        return matchCallback.callCount === 1;
      });
      runs(function() {
        expect(matchCallback.argsForCall[0][0]).toBeNull();
        scanner.findNextMatch("xxaxxbxxc", 0, matchCallback);
      });
      waitsFor(function() {
        return matchCallback.callCount === 2;
      });
      runs(function() {
        expect(matchCallback.argsForCall[1][0].index).toBe(0);
        scanner.findNextMatch("xxaxxbxxc", 4, matchCallback);
      });
      waitsFor(function() {
        return matchCallback.callCount === 3;
      });
      runs(function() {
        expect(matchCallback.argsForCall[2][0].index).toBe(1);
        scanner.findNextMatch("xxaxxbxxc", 7, matchCallback);
      });
      waitsFor(function() {
        return matchCallback.callCount === 4;
      });
      runs(function() {
        expect(matchCallback.argsForCall[3][0].index).toBe(2);
        scanner.findNextMatch("xxaxxbxxc", 9, matchCallback);
      });
      waitsFor(function() {
        return matchCallback.callCount === 5;
      });
      return runs(function() {
        expect(matchCallback.argsForCall[4][0]).toBeNull();
      });
    });


    it("includes the scanner with the results", function() {
      var scanner;
      scanner = new OnigScanner(["a"]);
      scanner.findNextMatch("a", 0, matchCallback);
      waitsFor(function() {
        return matchCallback.callCount === 1;
      });
      return runs(function() {
        expect(matchCallback.argsForCall[0][0].scanner).toBe(scanner);
      });
    });


    describe("when the string searched contains unicode characters", function() {
      it("returns the correct matching pattern", function() {
        var scanner;
        scanner = new OnigScanner(["1", "2"]);
        scanner.findNextMatch('ab…cde21', 5, matchCallback);
        waitsFor(function() {
          return matchCallback.callCount === 1;
        });
        return runs(function() {
          expect(matchCallback.argsForCall[0][0].index).toBe(1);
        });
      });
    });

  });
});
