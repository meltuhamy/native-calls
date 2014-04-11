Native Calls Structure
======================

The structure of Native Calls is given below.

There are ```NaClRPCModule```s which can be thought of as name spaces that contain layers of implementation.
These layers are shown below and explained below the diagram.


    +-------------------------------------------------------------------+
    |                           NaClRPCModule                           |
    |-------------------------------------------------------------------|
    |                                                                   |
    |                                                                   |
    |     +-------------------------------------------------------+     |
    |     |+-----------------------------------------------------+|     |
    |     || +--------------------+ Stub +----------------------+|| 1   |
    |     |+-----------------------------------------------------+|     |
    |     +-------------------------------------------------------+     |
    |                 +                      ^            ^             |
    |                 |                      |            |             |
    |                 |callRPC               |successCB   |errorCB      |
    |                 |                      |            |             |
    |                 v                      +            +             |
    |     +-------------------------------------------------------+     |
    |     |                        Runtime                        | 2   |
    |     +-------------------------------------------------------+     |
    |      +          +        +                ^           ^           |
    |      |          |        |                |handle     |           |
    |      |send      |send    |send            |Callback   |handle     |
    |      |Callback  |Error   |Request         |/handleCall|Error      |
    |      v          v        v                +           +           |
    |     +-------------------------------------------------------+     |
    |     |                        JSONRPC                        | 3   |
    |     +-------------------------------------------------------+     |
    |      +         +         +                ^                       |
    |      |         |         |                |                       |
    |      |sendRPC  |sendRPC  |sendRPC         |handleRPCCallback      |
    |      |Callback |Error    |Request         |/ handleRPCCall        |
    |      v         v         v                +                       |
    |     +-------------------------------------------------------+     |
    |     |                       Transport                       | 4   |
    |     +-------------------------------------------------------+     |
    |         +        +       +                ^                       |
    |         |        |       |                |                       |
    |         |        |       |                |                       |
    |         |on      |load   |postMessage     |handleMessage          |
    |         |        |       |                |                       |
    |         v        v       v                +                       |
    |     +-------------------------------------------------------+     |
    |     |+-----------------------------------------------------+|     |
    |     ||+-------------------+ NaClModule +------------------+|| 5   |
    |     |+-----------------------------------------------------+|     |
    |     +-------------------------------------------------------+     |
    |                                                                   |
    +-------------------------------------------------------------------+

If we have a complicated calculation that needs to be done using a native application written in C++, we write a module for it in both C++ and JavaScript.

The JavaScript module is explained here. It consists of method stubs whose implementations are in the native code.
For example, we consider some functions that calculate some floating point arithmetic,. The module would be called ```FloatingArithmetic```. Inside the module, we would have some stubs: ```float sum(float*)```, ```float product(float*)```, and ```float productSum(float*, float*)```.

Inside a method stub, which is the top layer depicted above (1), some checks are made to ensure the right types have been passed in to the stub. Eventually, the callRPC method is called. The callRPC method is part of the Runtime library.

Continuing from our example above, we consider the ```sum(float*)``` stub. In Javascript, this would be a function that takes in an array of Numbers and returns a ```float*``` representing their sum. But because our RPC system is asynchronous, the function would take in another parameter, a success callback, that gets called when the function returns. So the ```float sum(float*)``` function would look something like this:

```js
function sum(numbers, cb){
   ...
}
```

This would be the JS stub, encapsulated inside the RPC Module. Somewhere inside the stub body, a call to the RPC Runtime layer would be made that would look like this:

```js
callRPC("sum", numbers, cb);
```

The RPC Runtime (2) then constructs a json-rpc object. It also generates a new ID that uniquely identifies this function call. This ID is used to map callbacks with function calls. So when the C++ code finishes executing, the correct callback is made with the result of the RPC call. Eventually, the run time would construct a json-rpc object that looks like this:

```json
{
  "jsonrpc"    : "2.0",
  "method"     : "sum",
  "id"         : 123,
  "parameters" : numbers    /* the original array of numbers we passed in from the stub */
}
```

This JSON object is passed to the JSONRPC layer before being sent through the transport. The job of the JSONRPC layer (3) here (i.e. when the call is being made as opposed to received) is to verify that the object being sent actually matches the JSON-RPC spec before being sent. If it is validated successfully, it is passed to the transport layer.

The transport layer (4) loads the module, and uses the module's ```postMessage``` method to finally post the message to the actual C++ native client module (5).

The C++ code gets executed, a result is made on the C++ side, and is sent back to the javascript code using the pepper api with ```postMessage```. The message that is sent is again a JSON-RPC object, that would look something like this:

```json
{
  "jsonrpc" : "2.0",
  "result"  : 7789.32123,
  "id"      : 123
}
```

The postMessage is handled in JavaScript by the ```NaClModule```, and passed to the transport layer. It is then passed to the JSONRPC layer, where it identifies whether it is a callback, a call, or an error. If it is a callback, the handle callback method of the RPC Runtime is called with the result. Here, the runtime figures out which callback to call by making use of the ```id```. The callback is finally called with the result and the RPC is concluded.

A similar process is done when the C++ code wishes to make a Javascript remote procedure call. The difference is that this time, the JSONRPC layer identifies that this is a call as opposed to a response. The method is looked up in the RPC Runtime. If it is found, it is executed. Any errors thrown are sent back to the caller using the JSON-RPC error format. If no errors are made, a response is made using the runtime, and sent in a similar way to how a request was sent as explained above.


Automatically generating ```RPCModule```s
-----------------------------------------

Now that we understand the basic structure, we can take a look at how RPC Modules are automatically generated.

Recall, the ```RPCModule``` is the top layer and acts as a namespace for remote function stubs. Instead of making the C++ developer write the ```RPCModule``` manually, we simplify this process by generating the module automatically. All the C++ programmer has to do is write a definition of the functions he wants to define in a IDL (Interface Definition Language) file. The IDL format is taken from the [WebIDL standard](http://www.w3.org/TR/WebIDL/).

For example, let's say we want to expose some functions of our float array arithmetic library. We write a IDL file that defines the interfaces to the functions we wish to expose. The interface is as follows:

```IDL
interface FloatArithmetic {
  float[] vectorSum(float[] v1, float[] v2);
  float[] vectorSubtract(float[] v1, float[] v2);
  float[] vectorProduct(float[] v1, float[] v2);
};
```

Then, we pass this to our generator. Our generator will produce a ```FloatArithmeticRPCModule.js``` file:

```js
define(['RPCModule', 'NaClModule'], function(RPCModule, NaClModule){
  return new RPCModule({
    'module': new NaClModule({src:'FloatArithmetic/FloatArithmetic.nmf', name:'FloatArithmetic', id:'FloatArithmetic', type:'application/x-pnacl'}),
    'functions': [
      {'name': 'vectorSum', 'params': ['float[]', 'float[]'], 'returnType': 'float[]'},
      {'name': 'vectorSubtract', 'params': ['float[]', 'float[]'], 'returnType': 'float[]'},
      {'name': 'vectorProduct', 'params': ['float[]', 'float[]'], 'returnType': 'float[]'}
    ]
  });
});
```

This is the RPC Module we need in our JavaScript. So when we use this, we can do method calls like:

```js
var floatModule = require("FloatArithmeticRPCModule");
var vectorSumCallback = function(result){
  console.log(result);
};

var vectorSumError = function(e){
  console.error(e);
}

floatModule.vectorSum([1.25, 2.25], [0.75, -0.25], vectorSumCallback, vectorSumError);
```

What this will do is it will construct a JSON RPC object with the correct parameters:

```json
{
  "jsonrpc" : "2.0",
  "method" : "vectorSum",
  "params" : [ [1.25, 2.25] , [0.75, -0.25] ],
  "id" : 1,
}
```

This object will be sent to the C++ module. The C++ module will send a result back as follows:

```json
{
  "jsonrpc" : "2.0",
  "id" : 1,
  "result" : [2.0, 2.0]
}
```

This will make its way to the callback and eventually we will get a console.log with the result:
```js
[2.0, 2.0]
```

This works very easily for simple functions that take in simple types like numbers, etc. But what happens when we want to expose a function that accepts a complex data types with several fields? The solution is that we need to specify the structure of the complex type. We specify it as a Dictionary Type in the IDL file. For example, say we want to now write a function that calculates some complex numbers, with a real and imaginary type. We write the following in the IDL file:

```IDL
dictionary ComplexNumber {
  float realPart;
  float imaginaryPart;
};

interface FloatArithmetic {
  ComplexNumber[] vectorSumComplex(ComplexNumber[] v1, ComplexNumber[] v2);
};
```

This defines what a ```ComplexNumber``` is, and defines the function. We then use this in JavaScript like so:

```js
floatModule.vectorSum(  [ { "realPart": 1.0, "imaginaryPart": 2.0 }, { "realPart": 10.5, "imaginaryPart": 9.0 } ],
                        [ { "realPart": 2.0, "imaginaryPart": 1.0 }, { "realPart": 0.5, "imaginaryPart": 1.0 } ],
                        vectorSumCallback, vectorSumError);
```

The callback will then be called and result returned will be logged:

```js
[{"realPart": 3.0, "imaginaryPart": 3.0}, {"realPart": 11.0, "imaginaryPart": 10.0}]
```

In the JavaScript side, we construct the parameters using JSON as above. In the C++ side, the remote methods accept C Structs. The C structs are constructed using the IDL file. So for the ```ComplexNumber``` dictionary defined in the IDL above, the struct that will be generated is as follows:

```cpp
typedef struct ComplexNumber {
  float realPart;
  float imaginaryPart;
} ComplexNumber;
```

Now, the C++ developer will have to implement the function:

```cpp
ComplexNumber[] vectorSumComplex(ComplexNumber[] v1, ComplexNumber[] v2);
```

The function declaration and the typedef for the struct are both automatically generated in a header file called ```FloatArithmetic.h```. All the C++ developer will have to do is include this header file and implement the methods.


Sending binary data
-------------------

Finally, we consider sending binary data. Following from our previous example, what happens if the user from JavaScript performs a RPC request that has some binary data for a parameter? The solution is to map the binary data according to the type information given in the IDL file.

Following from our example above, consider the following call from JavaScript instead:

```js
floatModule.vectorSum(new Float32Array(10), new Float32Array(10, vectorSumCallback, vectorSumError);
```

The result is the JSON sent with a binary containing 10 contiguous 32-bit blocks of binary data. The binary data is sent to the NaCl C++ module. Because the C++ module also knows what format of data to expect, it then maps this data back onto C floats. So in the end, the C++ developer can still expect 2 arrays of floats as parameters to the ```vectorSum``` method he is implementing, regardless if they are sent as JSON arrays (i.e. they are sent as normal JS arrays from JavaScript) or whether they are sent as pure binary data.


IDL Types to number of bytes
----------------------------

According to the WebIDL spec, the integer types below have the corresponding size in bytes, as shown in the table below:


| IDL Type  | Size                           |
|-----------|--------------------------------|
| byte      | 1 byte                         |
| octet     | 1 byte (unsigned byte)         |
| short     | 2 bytes + unsigned version     |
| long      | 4 bytes + unsigned version     |
| long long | 8 bytes + unsigned version     |
| float     | 4 bytes (32 bit)               |
| double    | 8 bytes (64 bit)               |

We use this information to convert to/from binary on both the C++ and JavaScript ends.

Receiving (in Javascript) binary data
-------------------------------------

One question arises: when to send binary data to/from the module? Well, the answer is to do with why one should send
the RPC call with binary in the first place. The main advantage of sending binary data is the speed increase.

TODO: I need to figure out what kind of performance gains one could get when sending binary instead of sending JSON.

TODO: I need to find a way to allow the developer to explicitly send back binary instead of JSON

TODO: Maybe it would be better to send back binary in all cases? Or maybe there are cases where it is better to do so?

TODO: Find out if Pepper already sends binary in some cases...

Send binary when it's an array of bytes, octets, shorts, longs, floats, or doubles.

Leave this for now, as it is an optimisation technique...
