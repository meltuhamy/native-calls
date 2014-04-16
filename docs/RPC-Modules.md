# RPC Modules
An RPC module encapsulates all the rpc runtime and transfer logic into a single object.

The RPC module can be hand-coded or it can be generated using an IDL file.

# JavaScript RPC Module
Inside RPCModule.js, we can see the RPCModule class. To construct an RPC Module, you need to give it a config object.

The structure of the config object is best described with an example. Below is an IDL description of the interfaces.
Using this IDL, a JavaScript module is generated/written that would include the definitions, and is shown below:

IDL:

```idl
    interface Logger {
      DOMString helloName(DOMString name1);
      DOMString greetName(DOMString greeting, DOMString name);
    };

    interface Fib {
      unsigned long fib(Range r);
    };

    dictionary Range{
      unsigned long from;
      unsigned long to;
    };


```

Above, we can see the use of 2 interfaces, 3 methods, 1 dictionary type.
This information is translated into a corresponding config object that is passed into the constructor.

The config object is shown below:



```js
    {
        "module": new NaClModule({...}),
        "interfaces": [
          {
            "name": "Logger",
            "functions": [
              {
                "name": "helloName",
                "params": [{"name": "name1", "type": "string", "required": true}],
                "returnType": {"type": "string", "required": true}
              },

              {
                "name": "greetName",
                "params": [{"name": "greeting", "type": "string", "required": true},
                           {"name": "name", "type": "string", "required": true}],
                "returnType": {"type": "string", "required": true}
              }
            ]
          },
          {
            "name" : "Fib",
            "functions": [
              {
                "name": "fib",
                "params": [{"name": "r", "type": "Range", "required": true}],
                "returnType": {"type": "unsigned long", "required": true}
              }
            ]
          }
        ],

        "dictionaries": [
          {
            "name": "Range",
            "type": "object",
            "properties": {
              "from": {
                "type": "unsigned long",
                "required": true
              },
              "to": {
                "type": "unsigned long",
                "required": true
              }
            }
          }
        ]
    }
```

In fact, this is structure is based on the use of JSON Schemas. The basic configuration object has the following properties:

- ```module``` : The NaClModule object that this RPC module is hooked with. This is to do with the transport layer.

- ```interfaces``` : The interfaces defined for this module. A module can have many interfaces, as shown. Each interface might have some function definitions.
  - ```functions``` : A function is composed of 3 properties: the ```name``` of the function, its ```returnType``` which is a JSON Schema, and an array of ```params```, each element being a JSON schema too.

- ```dictionaries``` : This is an array of dictionary definitions used in the RPC. Each element is a JSON schema with a ```name``` and a type ```object```. The properties and value types are also well defined, thanks to the JSON schema format.

As discussed in the [structure.md](https://github.com/meltuhamy/native-calls/blob/master/docs/structure.md) doc, the configuration file is then used to generate stubs. This means, once the JavaScript module is constructed, we can do the following:

```js
   var config = {...}; // as defined above
   var m = new RPCModule(config);
   m.load(function(){
     // sends RPC successfully
     m.interfaces.Logger.helloName("Mohamed");

     // sends RPC successfully
     m.interfaces.Fib.fib({"from": 1, "to": 20});

     // throws an error
     m.interfaces.Fib.fib(10);
   });

```

The first two RPC calls are successful calls to the NaClModule. The second one fails, because ```10``` does not match the required format, as registered in the config.

### How it works
The RPCStub class is used behind the scenes to generate a function for each function definition in the config object. Inside this generated stub function, a JSON Schema validator is used to validate both the paramaters passed in to the function and the returned object from the NaCl module.

### From WebIDL to JSON schema
The core of paramater checking lies in the use of JSON schemas. This means complex structures defined in the WebIDL can be translated easily into JSON schema. Dictionary types become JSON schema references.


### Limitations
I still haven't thought about how I will represent *interface types*. Right now, you can technically allow a paramater to have a type that is an ```interface```. But that doesn't necessarily make sense for NaCl native calls.

# C++ RPC Module
I am thinking long and hard about how to do a similar thing for C++. Maybe it might make sense to implement JSON Schemas over C++, but then again maybe it won't make sense. I am planning to abstract away the use of ```pp::Var``` from the module implementer. In other words, the module implementer has to write his C++ module using pure C++ types. This means paramater marshalling will have to be completely automated and generated.

The only way I can think of doing this is to literally generate the C++ checking and casting code automatically. So for the WebIDL file above, this C++ code will be generated:

**MyRPCModule.h**
```cpp
#include <string>

typedef struct {
  unsigned long from;
  unsigned long to;
} Range;

namespace Logger {
  std::string helloName(std::string name1);
  std::string greetName(std::string greeting, std::string name);
}

namespace Fib {
  unsigned long fib(Range r);  
}
```

The C++ module writer will then need to implement the ```Logger::helloName```, ```Logger::greetName```, and ```Fib::fib``` methods.

The actual NaClInstance class will also be generated, with a massive if statement that checks and extracts the incoming types and wraps the return type.


# What's left
Interfaces and dictionary types are only one part of WebIDL. There are other types, including exceptions, enums, and typedefs. But these will be supported at a later time. You can find out more information about IDL support [here](https://github.com/meltuhamy/native-calls/blob/master/docs/PlannedIDLSupport.md).
