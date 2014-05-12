define(['TypeChecker'], function(TypeChecker){
  describe('TypeChecker', function(){

    it('should instantiate only with a module id', function(){
      expect(function(){
        new TypeChecker('myModule');
      }).not.toThrow();

      expect(function(){
        new TypeChecker();
      }).toThrow();
    });

    it('should validate idl types', function(){
      var tc = new TypeChecker('myModule');

      var checks = [
        {'type': 'byte', passing: [127, -128, 53], failing: [0.25, -129, 128, 150, "notanumber", {}, true, undefined, null]},
        {'type': 'octet', passing: [255, 0, 23], failing: [0.25, -1, -23, 257, "notanumber", {}, true, undefined, null]},
        {'type': 'short', passing: [32767, -32768, -234, 23], failing: [0.25, 32768, -32769, "notanumber", {}, true, undefined, null]},
        {'type': 'unsigned short', passing: [65535, 32767, 0, 23], failing: [0.25, 65536, -1, -32769, "notanumber", {}, true, undefined, null]},
        {'type': 'long', passing: [2147483647, -2147483648, 0, 23], failing: [0.25, 2147483648, -2147483649, "notanumber", {}, true, undefined, null]},
        {'type': 'unsigned long', passing: [4294967295, 0, 2323], failing: [0.25, -1, 4294967296, -2147483649, "notanumber", {}, true, undefined, null]},
        {'type': 'long long', passing: [9223372036854775807, -9223372036854775808, 232334], failing: [0.25, "notanumber", {}, true, undefined, null]}, // js doesnt support large numbers
        {'type': 'unsigned long long', passing: [18446744073709551615, 123123, 232334], failing: [0.25, -23123, "notanumber", {}, true, undefined, null]},
        {'type': 'any', passing: [0.25, -129, 128, 150, "notanumber", {}, true, undefined, null], failing: []},
        {'type': 'float', passing: [127, -128, 53, 0.2313123], failing: ["notanumber", {}, true, undefined, null]},
          // todo: allow String objects since that's how they're received in NaCl messages :(
        {'type': 'DOMString', passing: ["hello world", "lol", ''+new String("object")], failing: [0.25, -129, 23, {}, true, undefined, null]},
        {'type': 'boolean', passing: [true, false], failing: [0, 1, 0.25, -129, 128, 150, "notanumber", {}, undefined, null]},
        {'type': 'object', passing: [{}, {"t":true}, new Object(null)], failing: [0.25, -129, 128, 150, "notanumber", true, undefined, null]},
        {'type': 'null', passing: [null], failing: [0.25, -129, 128, 150, "notanumber", {}, true, undefined]},
        {'type': 'void', passing: [null], failing: [0.25, -129, 128, 150, "notanumber", {}, true, undefined]}
      ];

      for(var i = 0 ; i < checks.length; i++){
        var currentCheck = checks[i];
        var j = 0;
        for(j=0; j<currentCheck.passing.length; j++){
          // check valid
          expect(tc.check(currentCheck.type, currentCheck.passing[j])).toBe(true);
        }

        for(j=0; j<currentCheck.failing.length; j++){
          // check invalid
          expect(tc.check(currentCheck.type, currentCheck.failing[j])).toBe(false);
        }
      }

    });


    it('should allow adding dictionaries', function(){
      var tc = new TypeChecker('myModule');
      tc.registerDictionary({'name': 'MyDict'});
    });


    it('should not add dictionaries without a name', function(){
      var tc = new TypeChecker('myModule');
      expect(function(){
        tc.registerDictionary();
      }).toThrow();

      expect(function(){
        tc.registerDictionary({});
      }).toThrow();
    });


    it('should validate added dictionaries', function(){
      var tc = new TypeChecker('myModule');

      // before adding dictionary, should return false.
      expect(tc.check('MyDict', {})).toBe(false);

      tc.registerDictionary({'name': 'MyDict'});

      expect(tc.check('MyDict', {})).toBe(true);

    });


    it('should validate dictionaries with type referencing', function(){
      var tc = new TypeChecker('myModule');

      tc.registerDictionary({'name': 'MyDict', required:["name", "age"], properties: {"name": {"$ref": 'DOMString'}, "age": {"$ref": 'unsigned short'}}});

      expect(tc.check('MyDict', {})).toBe(false);
      expect(tc.check('MyDict', {"name": "Mohamed"})).toBe(false);
      expect(tc.check('MyDict', {"name": "Mohamed", "age": 23})).toBe(true);
      expect(tc.check('MyDict', {"name": 23, "age": 23})).toBe(false);
      expect(tc.check('MyDict', {"name": "Mohamed", "age": -12})).toBe(false);
    });

    it('should allow dictionaries to reference other dictionaries', function(){
      var tc = new TypeChecker('myModule');

      tc.registerDictionary({
        name: 'Person',
        required:["name", "age"],
        properties: {
          "name": {"$ref": 'DOMString'},
          "age": {"$ref": 'unsigned short'}
        }
      });

      tc.registerDictionary({
        'name': 'PersonID',
        required: ["person", "id"],
        properties: {
          "person": {"$ref": "Person"},
          "id": {"$ref": "unsigned long"}
        }
      });

      expect(tc.check('PersonID', {})).toBe(false);

      expect(tc.check('PersonID', {
        "person": {},
        "id": {}
      })).toBe(false);

      expect(tc.check('PersonID', {
        "person": {},
        "id": 1234
      })).toBe(false);

      expect(tc.check('PersonID', {
        "person": {
          "name": "Mohamed",
          "age": 12
        },
        "id": 1234
      })).toBe(true);

    });


    it('should allow arrays of idl types', function(){
      var tc = new TypeChecker('myModule');
      var arrayOfUnsignedShorts = {type: "array", items: {"$ref" : "unsigned short"}};
      var valid = tc.check(arrayOfUnsignedShorts, [123]);
      var invalid = tc.check(arrayOfUnsignedShorts, [-12]);

      expect(valid).toBe(true);
      expect(invalid).toBe(false);

    });


    it('should allow arrays of dictionary types', function(){
      var tc = new TypeChecker('myModule');
      tc.registerDictionary({
        name: 'Person',
        required:["name", "age"],
        properties: {
          "name": {"$ref": 'DOMString'},
          "age": {"$ref": 'unsigned short'}
        }
      });

      tc.registerDictionary({
        'name': 'PersonID',
        required: ["person", "id"],
        properties: {
          "person": {"$ref": "Person"},
          "id": {"$ref": "unsigned long"}
        }
      });

      var personDatabaseSchema = {
        "type": "array",
        "items": {"$ref": "PersonID"}
      };

      var validPersonDatabase = [
        {"id": 1, "person": {"name": "Mohamed", "age": 12}},
        {"id": 2, "person": {"name": "James", "age": 12}}
      ];

      var invalidPersonDatabase1 = [
        {"id": 1, "person": {"name": "Mohamed", "age": 12}},
        {"id": 2, "person": {"name": "James", "age": 'not a number'}}
      ];

      var invalidPersonDatabase2 = [
        {"id": 1, "person": {"name": "Mohamed", "age": 12}},
        {"person": {"name": "James", "age": 12}}
      ];

      expect(tc.check(personDatabaseSchema, validPersonDatabase)).toBe(true);
      expect(tc.check(personDatabaseSchema, invalidPersonDatabase1)).toBe(false);
      expect(tc.check(personDatabaseSchema, invalidPersonDatabase2)).toBe(false);

    });


    it("should support binary data", function(){
      var tc = new TypeChecker('myModule');

      var schema = {"binary":true};

      var correct = new ArrayBuffer(10);
      var incorrect = [123, "hello", [], {}, {numbers: 234}];

      expect(tc.check(schema, correct)).toBe(true);

      for(var i = 0; i < incorrect.length; i++){
        expect(tc.check(schema, incorrect[i])).toBe(false);
      }

    });

  });
});