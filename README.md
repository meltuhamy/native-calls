# Native Calls

Native Calls allows developers to write IDL files that get compiled into C++ and JavaScript stubs that implement RPC calls over ```postMessage```. The result is a nice, clean way of using Native Code straight from JavaScript!

Part of my final year project at Imperial College London.

This is still work in progress. Check the [milestones](https://github.com/meltuhamy/native-calls/issues/milestones) for details.

## WebIDL

The project uses WebIDL to define interfaces. The WebIDL is compiled into C++ and JavaScript stubs. Implementation details are in the [idl_parser directory](https://github.com/meltuhamy/native-calls/tree/master/idl_parser).

## Docs

You can read some design docs in the [docs folder](https://github.com/meltuhamy/native-calls/tree/master/docs).

The full project report (in progress) is written in TeX and is found in the [report folder](https://github.com/meltuhamy/native-calls/tree/master/report).
