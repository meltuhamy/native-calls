C++ Hand-coded RPC
------------------

C++ NaCl code is based on [tutorial](https://developers.google.com/native-client/devguide/tutorial).

The implementation is hand-coded, and uses [json-rpc 2.0](http://www.jsonrpc.org/specification).

To perform a C++ -> JavaScript RPC, create a NaClRPC object by setting the method and params paramaters. Then get the ```VarDictionary``` object, which is a public field of ```NaClRPC``` class called ```rpcDict``` and send it using ```PostMessage```. This is shown in ```index.html```. ```rpc.js``` handles the message to call the function received.