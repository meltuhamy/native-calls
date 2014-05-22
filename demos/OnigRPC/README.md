#Oniguruma RPC

The library is based on [node-oniguruma](https://github.com/atom/node-oniguruma).

Instead of using node.js native wrappers, we create a NaCl RPC library using Native Calls.

The library is generated using the .idl file.

#Setup

Running ```./setup.sh``` should build everything for you. It should:

* clone naclports if you haven't already (using the git submodule)
* copy the onig naclport included (```naclport_onig/onig```).
* build and install the nacl port
* build the rpc module

For this reason, it might take a while to compile your first build. Subsequent builds should take less time.