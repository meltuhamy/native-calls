# WebIDL

The project makes use of the WebIDL format to allow module developers to define interfaces to the methods they want to expose to JavaScript; and also the other way around.


## WebIDL Parser
We make use of a standards compliant IDL parser in JavaScript written by [Robin Berjon](http://berjon.com/) called [WebIDL2.js](https://github.com/darobin/webidl2.js). This parser takes in a string containing IDL definitions and returns a JavaScript object containing a abstract syntax tree representation of the IDL.

On top of this parser, we implement our own parser that will read in multiple IDL files, check the AST, and augment it for information that we can use to generate code. The components and flow of this is as follows:

```

                  file1.idl, file2.idl
                            +
                            |
                  +---------v----------+
                  |     IDLReader      |
                  +---------+----------+
                            |
                            v
                        idl string
                            +
                            |
                  +---------v----------+
      Syntax <---+|   webidl2 parser   |
      Errors      +---------+----------+
                            |
                            v
                      webidl2 AST
                            +
                            |
                  +---------v----------+
    Semantic <---+|    ASTAugmenter    |
    errors        +---------+----------+
                            |
                            v
                     augmented AST
                            |
        ...[Generator]......|...................
        .                   |                  .
        .         +---------v----------+       .
        .         |     ASTGenerator   |       .
        .         +---------+----------+       .
        .                   |                  .
        .                   v                  .
        .            destination AST           .
        .                   +                  .
        .                   |                  .
        .         +---------v----------+       .
        .         |   Code Generator   |       .
        .         +---------+----------+       .
        .                   |                  .
        ....................|...................
                            |
                            v
                    destination source

```

**Note: Code generation method has changed to use templates. Documentation soon**

We can see that the generator itself is composed of an AST generator and then a source generator. For example, if we are generating the JavaScript module, it goes through the JSGenerator which is composed of the JS AST generator. The JS AST generator is a list of JS AST nodes, which when passed through the JS code generator, produces string source code. The same is the case for C++ code generation.

For more details about the code generation process, read the [generators doc](https://github.com/meltuhamy/native-calls/blob/master/docs/generators.md).
