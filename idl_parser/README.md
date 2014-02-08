WebIDL parser and compiler
==========================

IDL Parser
----------

This includes a standards-compliant WebIDL parser obtained from the [Chromium](https://code.google.com/p/chromium/codesearch#chromium/src/tools/idl_parser/) project. The parser has been modified to allow IDL files that do not include [two comments](https://github.com/meltuhamy/native-calls/blob/e3e62051a0cd753d4b847ee8a38d84ee1707e296/idl_parser/idl_parser.py#L159) at the top of the file.

PLY is required. (easiest way to install it is by ```easy_install ply```).


Feed it a WebIDL file, and it will spit out an AST:

```
❯ cat example.idl
interface MyInterface {
  void myFunction(DOMString myString);
  DOMString myOtherFunction(DOMString myOtherString);
};

❯ ./idl_parser.py example.idl
AST()
  File(example.idl)
    Interface(MyInterface)
      Operation(myFunction)
        Type()
          PrimitiveType(void)
        Arguments()
          Argument(myString)
            Type()
              PrimitiveType(DOMString)
      Operation(myOtherFunction)
        Type()
          PrimitiveType(DOMString)
        Arguments()
          Argument(myOtherString)
            Type()
              PrimitiveType(DOMString)
```

Simple CPP Compiler
-------------------
Compiles WebIDL into C header files.

```
❯ ./idl_cpp.py test_cpp/interface_NaClAMTest.idl
/* interface: NaClAMTest*/
float sumFloatArray ( float* floats ,long length );
void subFloatArrays ( float* src1_dst ,float* src2 ,long length );
void addFloatArrays ( float* src1_dst ,float* src2 ,long length );
```

Testing
-------
Some unit tests are provided in the test_* folders. To run all tests, type ```./run_tests.py```.

**Note**: ```pycparser``` is required for running the cpp tests. You can get it from [here](https://github.com/eliben/pycparser) or install it using ```pip install pycparser```.