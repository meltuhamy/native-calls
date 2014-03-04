# Handcoded Native Calls

A simple implementation of RPC between JavaScript and C++ using Native Client, by hand coding the messages and paramater marshalling.

## Requirements

You will need to set up the [NaCl SDK](https://developers.google.com/native-client/dev/sdk/download) and set the ```NACL_SDK_ROOT``` environment variable.

You will need a recent version of ```node```, bigger than [0.10](http://nodejs.org/). 

## Building

Run ```make```. This will build the required ```.pexe``` file in the src directory.

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