Code Transpilers
----------------

The process of using WebIDL to generate JS and CPP code is similar to transpiling.

As discussed in the [WebIDL doc](https://github.com/meltuhamy/native-calls/tree/master/docs/webidl.md), we take a Abstract Syntax Tree (AST) representing the syntactic structure of the WebIDL, then we augment it to give more semantic meaning. We use the augmented AST to generate code.

The way this is done is through creating yet another AST representing the target language code.

This is done in the [```generator/```](https://github.com/meltuhamy/native-calls/tree/master/generator/) classes.

Generally, we use the AST tree to generate a RPC module, by using other node constructors. Some of these node constructors are general, such as the ```LineNode``` class. Others are specific to the target language, such as the ```Closure``` node class for JavaScript. By composing several nodes, we construct an AST for the target language. By calling the ```compile``` method on a root node, a string is generated which is the actual code that can be included in the project.