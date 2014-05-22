# Native Calls

Native Calls allows developers to write IDL files that get compiled into C++ and JavaScript stubs that implement RPC calls over ```postMessage```.
The result is a nice, clean way of using Native Code straight from JavaScript!

Part of my final year project at [Imperial College London](http://www3.imperial.ac.uk/computing/).

This is still work in progress, but feedback is much appreciated!

## Getting started
[Please read the getting started guide](https://github.com/meltuhamy/native-calls/tree/master/docs/getting-started.md) to see how Native Calls works and how to use it.

## Build
To build the project, you'll need the following requirements:

1. The [Native Client SDK](https://developers.google.com/native-client/dev/).
2. The [NACL_SDK_ROOT](https://developers.google.com/native-client/dev/devguide/devcycle/building) variable set.
3. [node.js](http://nodejs.org/)

To build, simply run ```make``` in this folder. This will get JavaScript dependencies, build the C++ RPC library and build each individual demo.

** Note: ** I have only tested this on Mac OSX and linux. Compiling on Windows will probably break.

## Run
To see it in action, make sure you have built the project (see above). Then, type ```make serve```. This will start a server in the project directory.

Visit the index page, by typing http://localhost:3000/ into your browser.

## Install
To install the C++ library to your SDK, run ```make install```.
This will build the library for all toolchains and configurations.

# Development

## Test
To run all tests, type ```make test```. This will test JavaScript front end, back end (generators), and C++ tests.
You can also test each component individually:

* ```make test``` runs all tests
* ```make nodetest``` runs generator tests
* ```make cpptest``` runs C++ rpc framework tests
* ```make eetest``` runs end-to-end tests
* ```make jstest``` runs JavaScript rpc framework tests

The tests are run using [karma](https://github.com/karma-runner/karma).

## Docs

You can read some design docs in the [docs folder](https://github.com/meltuhamy/native-calls/tree/master/docs).

The full project report (in progress) is written in TeX and is found in the [report repo](https://github.com/meltuhamy/native-calls-report).

## Eclipse
How to set up the Native Calls project in Eclipse.

A project has already been created and is in the repository. All you need to do is to configure it with your ```NACL_SDK_ROOT```.


1. Download [eclipse CDT](http://goo.gl/Rymz93)
2. Clone the [Native Calls project](http://goo.gl/qarpeD).
3. Copy the ```.cproject.sample``` file and save it as ```.cproject```.
4. Open eclipse
5. Import the project. ```File``` -> ```Import...``` -> ```Existing Project into Workspace```
6. Right click on the project and click properties.
7. Under ```C/C++ Build``` -> ```Enivronment```, set the ```NACL_SDK_ROOT``` variable to be the NaCl SDK location. Save for all configurations.
8. Under ```C/C++ Build``` -> ```Build Variables```, set the ```NACL_SDK_ROOT``` variable to be a directory pointing to your NaCl SDK location. Save for all configurations.
9. Right click on the project and choose ```Index``` -> ```Rebuild``` to rebuild the index.
10. Done! Clicking the build button runs ```make```.

You can also set up eclipse to debug the C/C++ application. This is shown in the [chromium how-to](http://www.chromium.org/nativeclient/how-tos/debugging-documentation/debugging-with-debug-stub-recommended/debugging-nacl-apps-in-eclipse-cdt).
