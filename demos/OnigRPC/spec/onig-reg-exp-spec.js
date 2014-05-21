describe('OnigRegExp', function() {
  describe('::search(string, index, callback)', function() {
    it('returns an array of the match and all capture groups', function() {
      var regex, result, searchCallback;
      regex = new OnigRegExp('\\w(\\d+)');
      searchCallback = jasmine.createSpy('searchCallback');
      result = regex.search('----a123----', searchCallback);
      waitsFor(function() {
        return searchCallback.callCount === 1;
      });
      return runs(function() {
        result = searchCallback.argsForCall[0][0];
        expect(result.length).toBe(2);
        expect(result[0].match).toBe('a123');
        expect(result[0].start).toBe(4);
        expect(result[0].end).toBe(8);
        expect(result[0].index).toBe(0);
        expect(result[0].length).toBe(4);
        expect(result[1].match).toBe('123');
        expect(result[1].start).toBe(5);
        expect(result[1].end).toBe(8);
        expect(result[1].index).toBe(1);
        return expect(result[1].length).toBe(3);
      });
    });
    it('returns null if it does not match', function() {
      var regex, result, searchCallback;
      regex = new OnigRegExp('\\w(\\d+)');
      searchCallback = jasmine.createSpy('searchCallback');
      result = regex.search('--------', searchCallback);
      waitsFor(function() {
        return searchCallback.callCount === 1;
      });
      return runs(function() {
        result = searchCallback.argsForCall[0][0];
        return expect(result).toBeNull();
      });
    });
    xdescribe('when the string being searched contains a unicode character', function() {
      return it('returns correct indices and lengths', function() {
        var regex, searchCallback;
        regex = new OnigRegExp('a');
        searchCallback = jasmine.createSpy('searchCallback');
        regex.search('ç√Ωa', 0, searchCallback);
        waitsFor(function() {
          return searchCallback.callCount === 1;
        });
        runs(function() {
          var firstMatch;
          firstMatch = searchCallback.argsForCall[0][0];
          expect(firstMatch[0].start).toBe(3);
          expect(firstMatch[0].match).toBe('a');
          return regex.search('ç√Ωabcd≈ßåabcd', 5, searchCallback);
        });
        waitsFor(function() {
          return searchCallback.callCount === 2;
        });
        return runs(function() {
          var secondMatch;
          secondMatch = searchCallback.argsForCall[1][0];
          expect(secondMatch[0].start).toBe(10);
          return expect(secondMatch[0].match).toBe('a');
        });
      });
    });
    xdescribe('when the string being searched contains non-Basic Multilingual Plane characters', function() {
      return it('returns correct indices and matches', function() {
        var regex, searchCallback;
        regex = new OnigRegExp("'");
        searchCallback = jasmine.createSpy('searchCallback');
        regex.search("'\uD835\uDF97'", 0, searchCallback);
        waitsFor(function() {
          return searchCallback.callCount === 1;
        });
        runs(function() {
          var match;
          match = searchCallback.argsForCall[0][0];
          expect(match[0].start).toBe(0);
          expect(match[0].match).toBe("'");
          return regex.search("'\uD835\uDF97'", 1, searchCallback);
        });
        waitsFor(function() {
          return searchCallback.callCount === 2;
        });
        runs(function() {
          var match;
          match = searchCallback.argsForCall[1][0];
          expect(match[0].start).toBe(3);
          expect(match[0].match).toBe("'");
          return regex.search("'\uD835\uDF97'", 2, searchCallback);
        });
        waitsFor(function() {
          return searchCallback.callCount === 3;
        });
        return runs(function() {
          var match;
          match = searchCallback.argsForCall[2][0];
          expect(match[0].start).toBe(3);
          return expect(match[0].match).toBe("'");
        });
      });
    });
  });
  describe('::test(string, callback)', function() {
    it('calls back with true if the string matches the pattern', function() {
      var testCallback;
      testCallback = jasmine.createSpy('testCallback');
      new OnigRegExp("a[b-d]c").test('aec', testCallback);
      waitsFor(function() {
        return testCallback.callCount === 1;
      });
      runs(function() {
        expect(testCallback.argsForCall[0][0]).toBe(false);
        return new OnigRegExp("a[b-d]c").test('abc', testCallback);
      });
      waitsFor(function() {
        return testCallback.callCount === 2;
      });
      return runs(function() {
        return expect(testCallback.argsForCall[1][0]).toBe(true);
      });
    });
  });
});
