# Bullet physics demo using RPC

This work is based on John McCutchan's [original implementation](http://www.johnmccutchan.com/2012/10/bullet-native-client-acceleration-module.html) and also Binji's [pepper.js modification](https://github.com/binji/NaClAMBase/tree/pnacl-demo).
The difference is that all communication code is handled entirely using Native Calls, and the library is generated using ```Bullet.idl```.

# Setup

Running ```./setup.sh``` should build everything for you. It should:

* clone naclports if you haven't already (using the git submodule)
* build and install the bullet nacl port
* build the rpc module

For this reason, it might take a while to compile your first build. Subsequent builds should take less time.

# Performance differences
To see how well the two implementations perform,

1. Start the server (go to project root and run ```make serve```).
2. Open THREE windows in Chrome (not tabs, windows.)
3. In window 1, open ```http://localhost:3000/demos/BulletRPC/```, this is the Native Calls version.
4. In window 2, open ```http://localhost:3000/demos/BulletRPC/BulletNaClAm/```, this is the NaClAM version.
5. In window 3, open ```http://localhost:3000/demos/BulletRPC/bench.html```, this will show performance graphs.
6. Try loading different scenes and see how each version performs.