# Bullet physics demo using RPC

This work is based on John McCutchan's [original implementation](http://www.johnmccutchan.com/2012/10/bullet-native-client-acceleration-module.html).
The difference is that all communication code is handled entirely using Native Calls, and the library is generated using ```Bullet.idl```.

# Setup

Running ```./setup.sh``` should build everything for you. It should:

* clone naclports if you haven't already (using the git submodule)
* build and install the bullet nacl port
* build the rpc module

For this reason, it might take a while to compile your first build. Subsequent builds should take less time.

