# Hand coded Native Calls

A simple implementation of RPC between JavaScript and C++ using Native Client, by hand coding the messages and paramater marshalling.

For information about how native calls works, please read the [design documents](https://github.com/meltuhamy/native-calls/tree/master/docs).

## Requirements

You will need to set up the [NaCl SDK](https://developers.google.com/native-client/dev/sdk/download) and set the ```NACL_SDK_ROOT``` environment variable.

You will need a recent version of ```node```, bigger than [0.10](http://nodejs.org/).

## Building

Run ```make``` in this folder. This will make each of the demo modules' ```pexe```s.

## Running the demos

In this folder, you'll find ```index.html```. However, NaCl modules need a server to execute, so opening this file directly probably won't work.

What you'll need to do instead is start a server in this directory. You could do this using python or node.js easily.

I use the node.js [http-server package](https://www.npmjs.org/package/http-server). You can install it by typing ```npm install -g http-server```. Now, in the folder containing the index.html file, run ```http-server```. This will start a local server serving the folder you're in, and can be accessed through ```http://localhost:8080/```. Type this into Chrome and you should see the example. Read the web page to try out the RPC functionality.

## Testing

JavaScript unit tests are written in the test folder. To run them, simply run ```make test```. This will both check dependencies and run the tests.

## Setting up in eclipse

Copy the ```.cproject.sample``` file to and save it as ```.cproject```.

```
cp .cproject.sample .cproject

```

Edit the .cproject file by changing the ```NACL_SDK_ROOT``` directory to your own directory.

```
<!-- Replace this with your actual NACL_SDK_ROOT directory. -->
<stringMacro name="NACL_SDK_ROOT" type="VALUE_PATH_DIR" value="YOU-DIRECTORY"/>

```

Now, set up the project in eclipse by choosing ```File``` -> ```Import...```, ```General``` -> ``` Existing Projects into Workspace```.
