# Native Calls

Native Calls allows developers to write IDL files that get compiled into C++ and JavaScript stubs that implement RPC calls over ```postMessage```. The result is a nice, clean way of using Native Code straight from JavaScript!

Part of my final year project at Imperial College London.

This is still work in progress. Check the [milestones](https://github.com/meltuhamy/native-calls/issues/milestones) for details.

## Build
To build the project, you'll need the following requirements:

To build, simply run ```make``` in this folder. This will get JavaScript dependencies, build the C++ RPC library and build each individual demo.

## Run
To see it in action, make sure you have built the project (see above). Then, type ```make serve```. This will start a server in the project directory.

Visit the index page, by typing http://localhost:3000/ into your browser.

## Test
To run all tests, type ```make test```. This will test JavaScript front end, back end (generators), and C++ tests.

To test only the generator tests, type ```make nodetest```.


## Docs

You can read some design docs in the [docs folder](https://github.com/meltuhamy/native-calls/tree/master/docs).

The full project report (in progress) is written in TeX and is found in the [report folder](https://github.com/meltuhamy/native-calls/tree/master/docs/report).
