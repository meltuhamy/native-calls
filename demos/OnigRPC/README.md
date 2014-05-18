#Oniguruma RPC

The library is based on [node-oniguruma](https://github.com/atom/node-oniguruma).

Instead of using node.js native wrappers, we create a NaCl RPC library using Native Calls.

The library is generated using the .idl file.

#Setup

## Install oniguruma port for NaCl

1. Clone the [naclports](https://code.google.com/p/naclports/wiki/HowTo_Checkout?tm=4) project. The naclports project is already set up as a git submodule for this project. You can clone it by running ```git submodule update --init```, and you'll find it in the root project folder.
2. Copy the ```onig``` folder in the ```naclport_onig``` folder, and put it into the ```naclports/ports``` folder.
   ```cp -r naclport_onig/onig ../../naclports/ports/```
3. Run the naclports installation script: ```cd ../../naclports && ./make-all.sh onig```
4. This will download the oniguruma c library and install it in your ```$NACL_SDK_ROOT```.

## Install Native Calls and build demo

1. Install Native Calls RPC Library for pnacl release toolchain (```make TOOLCHAIN=pnacl CONFIG=Release``` at project root)
2. Generate RPC Library using ```./setup.sh```
3. Run the server at project root (```make serve```)
4. Navigate to ```http://localhost:3000/demos/OnigRPC/```