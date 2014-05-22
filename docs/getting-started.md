# Native Calls Getting Started Guide

This guide shows how to create a simple C++ library using Native Calls.
We will create a complex number calculator using a C++ native module. I've written this tutorial in a way such that you can follow along and write the module yourself.

## Contents

*  [Introduction](#introduction)
*  [Requirements and setting up](#requirements-and-setting-up)
*  [Writing our interface using Web IDL](#writing-our-interface-using-web-idl)
*  [Generating the RPC module](#generating-the-rpc-module)
*  [Implementing the interface](#implementing-the-interface)
*  [Building our RPC Module](#building-our-rpc-module)
*  [Using our library from JavaScript](#using-our-library-from-javascript)
*  [Making remote procedure calls from JavaScript](#making-remote-procedure-calls-from-javascript)
*  [Next steps](#what-now)

## Introduction

### Google Native Client (NaCl)

Native Client is a type of plugin for the browser (currently only Chrome) that allows you to run native binary programs inside a browser sandbox without worrying about security and portability. This means you get the high performance features of a native application, with the portability and security of the web. You can read all about it [here](https://developer.chrome.com/native-client), where you'll also find documentation and demos of what it can do.

Native Client applications can communicate with JavaScript using ```postMessage```, a simple message-passing API that uses [```pp::Var```](https://developer.chrome.com/native-client/pepper_stable/cpp/classpp_1_1_var) in C++ to interface with JavaScript values and objects.

### 90% Web App, Native Performance Where You Need It

Although you can use NaCl to do many things, one interesting use case for it is the ability to use it in your web application to make it have native performance. "90% Web App, Native Performance Where You Need It" was John McCutchan's slogan for his [Native Client Acceleration Modules](http://www.johnmccutchan.com/2012/10/bullet-native-client-acceleration-module.html) idea. The basic idea was to use Native Client to create fast, native *libraries* that you can access from JavaScript. He wrote a nice demo, a physics simulation, using the bullet physics engine on C++ but everything else was a web application (including the 3D rendering).

### Native Calls libraries

John McCutchan's Acceleration Modules idea was really nice, but it was a bit tedious to write. The C++ developer had to convert JavaScript types into the C++ types they were used to. Moreover, although there was a library to make it slightly easier to send and receive data from JavaScript, the developer had to use it still as a message passing interface.

Native Calls was created to make it very easy for C++ developers to create native modules that are both easy to use from JavaScript, and easy to write in C++. It works by having Remote Procedure Call (RPC) libraries on both the JavaScript and C++. The libraries are built on top of the message passing ```postMessage``` API, and use the simple [JSONRPC protocol](http://www.jsonrpc.org/specification). Native Calls supports automatic JavaScript/C++ type conversions built on top of the ```pp::Var``` API.

Essentially, as we will see below, the C++ developer writes their application normally, and Native Calls will generate a full JavaScript library that interfaces with the C++.

To demonstrate how easy it is to use, I have ported John McCutchan's [bullet physics demo](https://github.com/meltuhamy/native-calls/tree/master/demos/BulletRPC) to use Native Calls as well as [GitHub](https://github.com/atom/node-oniguruma)'s node-oniguruma [regular expression library](https://github.com/meltuhamy/native-calls/tree/master/demos/OnigRPC) to use Native Client. This tutorial will give you a feel of how easy it is to write a Native Client library that can be used from JavaScript.

## Requirements and setting up

### NaCl SDK
Since this will be a [Native Client](https://developer.chrome.com/native-client) module, we will need to download and set up the NaCl SDK.
You can download the SDK from [here](https://developer.chrome.com/native-client/sdk/download).
Follow the instructions given in the link to download and install the latest stable Pepper release.

### Setting ```$NACL_SDK_ROOT```
Once you have set up the SDK, you'll need to set the ```$NACL_SDK_ROOT``` environment variable.
This should point to your Pepper installation. For example, for pepper 34 this would be:
```/path/to/nacl_sdk/pepper_34```. You can set it up by adding this line to your ```.bashrc``` file:

```bash
export NACL_SDK_ROOT="/path/to/nacl_sdk/pepper34"
```

and restarting your terminal or ```source .bashrc```.

### Node.js

Native Calls uses a generator that is written for the node.js platform.
Therefore, you will need to download install node.js from the [official website](http://nodejs.org/).

### Install Native Calls

Next, you will need to install the Native Calls library to your SDK installation.
To do this, clone the repository, install dependencies, and building the project:

```bash
cd ~/
git clone git@github.com:meltuhamy/native-calls.git
cd native-calls
make install
```
This will get all node.js dependencies, and will compile and install the library for all available toolchains for both Debug and Release configurations.
It will also build a unified JavaScript file that we will use on our html page.

We're finally ready to create our native library!

## Writing our interface using Web IDL

Native Calls works by generating JS and C++ that handles communication between your native module and any JavaScript application. To do this, you'll need to tell Native Calls what functions you want to expose to JavaScript. You do this by writing the interface using Web IDL (which is very simple). Native Calls then takes this IDL file and generates the code for you.

Let's begin by creating a folder for our complex number calculator project.

```bash
mkdir complexCalculator
cd complexCalculator
vim complex.idl
```

Now, we write our complex number calculator IDL file (```complex.idl```):

```idl
dictionary complex {
  double r;
  double i;
};

interface Calculator {
  complex add(complex x, complex y);
  complex subtract(complex x, complex y);
  complex multiply(complex x, complex y);
  complex sum_all(sequence<complex> contents);
  complex multiply_all(sequence<complex> contents);
  sequence<double> map_abs(sequence<complex> contents);
};
```

Before moving on, let's take a closer look at the interface.

### Defining dictionary types

Dictionary types get converted into C++ ```struct```s. On JavaScript, they define JavaScript objects. In the above, the ```complex``` dictionary defines a struct in C++ that has the fields ```r``` and ```i```. It also defines the JavaScript object with the properties ```r``` and ```i```.

Once a dictionary is defined, it can be used as a type. Native Calls allows many types, as defined in the [Web IDL specification](http://www.w3.org/TR/WebIDL/).

### Defining interfaces

An interface can include definitions for many functions. These functions will be exposed to the JavaScript (i.e. we'll be able to call these functions directly from Javascript). In the IDL above, we defined ```add```, ```subtract``` and ```multiply``` which all take two paramaters of ```complex``` type and return a ```complex``` type.

Meanwhile, ```sum_all``` takes a ```sequence``` type. Sequences get converted into C++ ```std::vector```s, and on JavaScript, they're arrays.

## Generating the RPC module

Now that we've defined the interface for the module, we now pass it to the generator. The generator lives in ```native-calls/generator/generator-cli.js``` and is executed using ```node```. In the ```complexCalculator``` folder, generate the code like this:

```bash
node ~/native-calls/generator/generator-cli.js --package=Complex complex.idl
```
The generator will create a folder called Complex (matching the ```--package``` option). Let's take a look inside.

```bash
cd Complex
ls
```
Using the IDL file, we can see that the generator generated the following files:

* ```Calculator.h``` This is the C++ interface that we need to implement
* ```ComplexRPC.cpp``` This is the C++ RPC library, specific to our Complex number calculator
* ```ComplexRPC.js``` The javascript file that we can include in our HTML to interface with the C++ library.
* ```ComplexTypes.h``` Since we defined some extra types, (the ```complex``` dictionary type), this file is generated and includes the corresponding C++ ```struct```.
* ```Makefile``` Finally, a makefile is generated for us to be used as a template.

Take a look at each file to see how the RPC library works. Most importantly let's see what's inside ```Calculator.h``` and ```ComplexTypes.h```.

```bash
less ComplexTypes.h
```

```cpp
//...
typedef struct {
  double r;
  double i;
} complex;

```

As we expected, the dictionary was converted into an equivalent ```struct```.

```bash
less Calculator.h
```

```cpp
#include "ComplexTypes.h"
#include "nativecalls/RPCType.h"
#include <vector>

complex add( complex x,  complex y);

complex subtract( complex x,  complex y);

complex multiply( complex x,  complex y);

complex sum_all( std::vector<complex> contents);

complex multiply_all( std::vector<complex> contents);

std::vector<double> map_abs( std::vector<complex> contents);

```

We can see that the generator created a header file for us to implement. The header file is entirely standard C++, using no extra libraries.

## Implementing the interface

We can now start writing our implementation. The generated ```Makefile``` requires us to write the implementation in a file called ```Calculator.cpp```, matching our interface name (```Calculator.h```), in the same folder (```~complexCalculator/Complex/```). Feel free to skip over the actual implementation. I've placed it here so you can copy it if you've been following along with the tutorial.

```bash
vim Calculator.cpp
```

```cpp
#include "Calculator.h"

#include <complex>
#include <vector>

complex add(complex x, complex y){
	complex cd;
	std::complex<double> std_cd = std::complex<double>(x.r, x.i) + std::complex<double>(y.r, y.i);
	cd.r = std_cd.real();
	cd.i = std_cd.imag();
	return cd;
}

complex subtract(complex x, complex y){
	complex cd;
	std::complex<double> std_cd = std::complex<double>(x.r, x.i) - std::complex<double>(y.r, y.i);
	cd.r = std_cd.real();
	cd.i = std_cd.imag();
	return cd;
}

complex multiply(complex x, complex y){
	complex cd;
	std::complex<double> std_cd = std::complex<double>(x.r, x.i) * std::complex<double>(y.r, y.i);
	cd.r = std_cd.real();
	cd.i = std_cd.imag();
	return cd;
}

complex sum_all(std::vector<complex> contents){
	std::complex<double> currentSum(0,0);
	complex sum;
	for(std::vector<complex>::iterator it = contents.begin(); it != contents.end(); ++it) {
		complex current_cd = *it;
	    currentSum += std::complex<double>(current_cd.r, current_cd.i);
	}
	sum.r = currentSum.real();
	sum.i = currentSum.imag();
	return sum;
}


complex multiply_all(std::vector<complex> contents){
	std::complex<double> currentSum(1,0);
	complex sum;
	for(std::vector<complex>::iterator it = contents.begin(); it != contents.end(); ++it) {
		complex current_cd = *it;
	    currentSum *= std::complex<double>(current_cd.r, current_cd.i);
	}
	sum.r = currentSum.real();
	sum.i = currentSum.imag();
	return sum;
}


std::vector<double> map_abs(std::vector<complex> contents){
	std::vector<double> r;
	for(std::vector<complex>::iterator it = contents.begin(); it != contents.end(); ++it) {
		complex current_cd = *it;
	    r.push_back(abs(std::complex<double>(current_cd.r, current_cd.i)));
	}
	return r;
}

```

Without delving too much into the implementation details, what we wrote here was all pure C++. We didn't need to use any libraries (other than ```std```), and we simply returned the results, just like we're used to doing.

Now, all we have to do is compile and include the library in our html file.

## Building our RPC Module

For the most part, our generated ```Makefile``` will do everything for us. Depending on how complex our RPC functions are, we might need to tweak it a bit. But for our complex number calculator project, we can simply call ```make``` and everything will work.

```bash
make
```

```bash
  CXX  pnacl/Release/ComplexRPC.o
  CXX  pnacl/Release/Calculator.o
  LINK pnacl/Release/Complex_unstripped.bc
  FINALIZE pnacl/Release/Complex_unstripped.pexe
  CREATE_NMF pnacl/Release/Complex.nmf
```

This build process is actually included from ```$(NACL_SDK_ROOT)/tools/common.mk```, which is used to build the NaCl SDK's examples. We use it here to make it easy to change toolchain and configuration. The default toolchain is ```pnacl``` and the default config is ```Release```, but we could use any of the available toolchains (```pnacl```, ```newlib```, and ```glibc```). For example, we can build the same application using newlib by running ```make TOOLCHAIN=newlib```. You can read more about the NaCl supported toolchains [here](https://developer.chrome.com/native-client/devguide/devcycle/building).

In the end, a ```.pexe``` file is generated along with the [NaCl Manifest](https://developer.chrome.com/native-client/reference/nacl-manifest-format) (```Complex.nmf```).

Interestingly, we can package the whole Complex folder into a zip or tar file and distribute it for any JavaScript developer to use on their website, without even needing to compile it.

## Using our library from JavaScript

We now have a binary native client application that we can include into our web application. To include it, we will use the Native Calls JavaScript library. The Native Calls JavaScript library was generated when we installed the Native Calls library using ```make install```. The generated file can be found in ```~/native-calls/scripts/build/NativeCalls.js```. We need to put this file into our html file, along with the generated RPC module (```complexCalculator/Complex/ComplexRPC.js```).


We copy the built ```NativeCalls.js``` file into our ```complexCalculator``` folder, and then we can write our html file that uses the library.

```bash
cp ~/native-calls/scripts/build/NativeCalls.js ./
vim index.html
```

```html
<!DOCTYPE html>
<html>
<head lang="en">
    <meta charset="UTF-8">
    <title>Complex Number Calculator</title>
    <script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/require.js/2.1.11/require.min.js"></script>
    <script>
    require(['./Complex/ComplexRPC.js'], function (ComplexRPC) {
        window.Complex = new ComplexRPC();
    });
    </script>
</head>
<body>
<h1>Complex Number Calculator</h1>
</body>
</html>
```

Now, all that's left is to see the library in action! To do this, Native Client requires that the files are hosted on a server. Let's install a configure-free server such as ```serve```.

```bash
npm install -g serve
```

Great, now we can host a server in our ```complexCalculator``` folder, by simply running serve.

```bash
serve
```

```bash
serving ~/complexCalculator on port 3000
```

Now, open chrome and navigate to ```http://localhost:3000/```, then open the console to start using the library.

## Making remote procedure calls from JavaScript

<img align="right" height="119" src="http://i.imgur.com/3UI1g9i.png">
With the console open, we can try out some remote procedure calls. You'll notice that the functions we exposed using the idl file are available to us in the console window. The functions work as you would expect, but they are always completely **asynchronous** since ```postMessage``` is used as the underlying transfer layer. We can see what data is sent and received in the console. Let's call ```add``` to add two numbers.

```js
Complex.Calculator.add({r:10, i:10}, {r:5, i:-10}, function(result){
  console.debug(result);
});
```

We can see the data being transferred in the console:

```js
[NaClModule:Complex] → {"jsonrpc":"2.0","method":"Calculator::add","id":3,"params":[{"r":10,"i":10},{"r":5,"i":-10}]}

[NaClModule:Complex] ← {"id":3,"jsonrpc":"2.0","result":{"i":0,"r":15}}
```

And finally the result being logged:

```js
Object {i: 0, r: 15}
```

This is the expected result. In fact, all remote procedure calls from JavaScript take in an extra, optional, 2 paramaters: a success callback and an error callback. But what happens if we do not provide the correct number of paramaters? The RPC library is able to detect this, by throwing an error:

```js
Complex.Calculator.add();
```

```
TypeError: The function add expects 2 parameter(s) but received 0
```

The RPC library also has reasonable type checking. For example if we did not pass in an object:

```js
Complex.Calculator.add("hello", "world");
```

```
TypeError: Parameter 0 has invalid type: string (expected object)
```

Client side type-checking is also recursive:

```js
Complex.Calculator.add({r:12, i:23}, {r:3 ,i:"not a number"});
```

```
TypeError: Parameter 1 has invalid type: string (expected number) [at .i]
```

Type checking also happens on the C++ side. In that case, the error callback is called.


### Configuration
Before the module constructs, we can specify some configuration. We can specify the toolchain, config, and whether or not we want client-side type checking (as shown above). To do this, we edit the ```script``` tag that loads the module, and set the global NaClConfig object.

```html
<script>
window.NaClConfig = {
  VALIDATION: false // can also set TOOLCHAIN and CONFIG
};
require(['./Complex/ComplexRPC.js'], function (ComplexRPC) {
    window.Complex = new ComplexRPC();
});
</script>
```

Now, when we refresh and make a remote procedure call with incorrect types, the callback will be called - i.e. type checking in the C++ has rejected the call.

```js
var success = function(result){ console.log(result); };
var error = function(error){ console.error("ERROR! "+JSON.stringify(error)); };
Complex.Calculator.add({r:12,i:23},{r:3,i:"not a number"}, success, error);
```

```
ERROR! {"code":-32602,"message":"Invalid Params: Param 1 (y) has incorrect type. Expected complex"}
```

Turning off JS Validation can increase performance, especially for applications that perform many requests per second.



## What now

We've covered the basics of generating modules, and for a large number of cases, this is all we need! Using the IDL file made it really simply to set up our application, with several different type supported - from primitive types like numbers, booleans, strings, to complex types like objects and arrays... and arrays of objects! (*NOTE* arrays of arrays are currently not supported).

Notice however, it is difficult to create a truly object-oriented RPC call. The functions we exposed are completely singleton based. But it is possible to emulate object oriented calls, by making the C++ store a collection of instances of a class in a singleton and choosing an instance based on an ID we give it. This is done in the [onguruma demo](https://github.com/meltuhamy/native-calls/tree/master/demos/OnigRPC).

We also haven't talked about what happens if we want to throw errors in the C++. For example, what happens if someone tries to find the -1th fibonacci number? Throwing exceptions is not supported in the C++, but you *can* raise errors by accepting an Error object in the C++, and identifiying the functions that could throw an error in the IDL using a special ```[ThrowsRPCError]``` tag. This is done in the [Fib](https://github.com/meltuhamy/native-calls/tree/master/test/e2e/Fib_Implementation) end to end test.
