#Evaluation plan

The project has a qualitative evaluation as well as a quantitative evaluation.

The qualitative part is to do with how "developer friendly" the system is, as a whole.
To measure it, we look at the code written by the developer, as well as the learning curve required to write a complete library from javascript to C++.

The quantitative part is to do with the performance characteristics of the RPC library.
To measure it, we measure the average time it takes to do a native computation, the time spent in the RPC library code, and the time spent in the Javascript library code. Therefore, we can calculate roughly how much of an overhead using the library will impact on the performance.

To study these two characteristics, we will use two applications:

* A rigid-body physics simulation using the bullet physics library
* A regular expression engine written in C++ using the Oniguruma library.

##Performance evaluation: how fast is it?
The two applications mentioned above have slightly different performance requirements.

* The physics simulation requires high data transport and type marshalling speed, since large amounts of data will be transported from the Javascript application, used to render the graphics, to the C++ application, used to compute the physics simulation. RPC calls are made 60 times per second, so this will "stress-test" the RPC system, both on the Javascript and C++ side.

* The regular expression engine will be less intensive on the requests per second, but perhaps might be more intensive in terms of the *amount* of data being sent, as well as the binary performance of the actual library. For example, one request could be a regular expression search in a string containing thousands of lines. Now, the time taken in the RPC system will perhaps be very small compared to the time taken by the library itself to carry out the regular expression search.

For both applications, we will measure the amount of time spent in:

* The JavaScript RPC library
* The C++ RPC library
* The C++ library itself (i.e. as if the application were written without an RPC library)

We will therefore be able to calculate:

* The time spent *transferring* data between Javascript and C++ by the Pepper API
* The overhead of using the RPC library

The data we collect will give us an insight of the performance of two different, but common, classes of applications, as mentioned above.

###Performance Comparisons
As well as the detailed analysis that will be carried out above, we will also compare the performance of each whole application to its non-NaCl implementation.

1. For the physics simulation, we will compare three different measurements for the overall performance of the application, using...
    * Pure JavaScript: this will use the emscripten version of the Bullet Physics library.
    * John McCutchan's [original implementation](http://www.johnmccutchan.com/2012/10/bullet-native-client-acceleration-module.html): this uses NaCl and Pepper, but is hand coded and tweaked for performance (for example, shared memory binary transfer is used).
    * Native Calls RPC library.

2. For the regular expressions library, we will compare the overall performance of the application, using...
    * The [original application](https://github.com/atom/node-oniguruma/), written by the GitHub authors, which uses a *local* node.js backend with a native node.js plugin for oniguruma. Data is sent to the server using websockets.
    * The Native Calls RPC library.
    
The comparisons will give us some insights as to how much more efficient it is to write the library using our RPC library, compared to:

* a hand coded/optimised implementation
* a pure Javascript implementation
* a native implementation that runs on a local server.




## Usage evaluation: how easy is it to use?
We will analyse the lines of code required to write the same application, with and without the RPC library. This will tell us roughly how much effort the developer will need to put in to the implementation in order to get the same application working. However, it might not be a completely accurate representation, since it may be that the application which is hand coded is more prone to errors and bugs that the RPC system will automatically handle for the developer. Also, it may be that the RPC system has far more features compared to the hand-coded system. 

Therefore, to get a more accurate representation of developer satisfaction, the best thing to do might be to ask a developer! I plan to open-source the project and get feedback on how useful it is.

There are also some developer-friendly features of the library that could make the RPC framework easier to use. 

This includes JavaScript type checking. For example, if a request expects a string, and in JavaScript a number is passed, then the JavaScript library will throw an error - and this is completely automated. The targeted use case here is when the library is used to generate a general library, such as the ongiruma library mentioned above. When the C++ developer builds and packages the library, the JavaScript user can download it and treat it like a black box, just like any JavaScript library is treated. The API is provided, and if incorrect input is given, the JavaScript will complain. This means the JavaScript developer can debug their application without worrying about whether it is a problem to do with the binary program. And this is given at no extra cost to the C++ developer.

These kinds of features are hard to "measure", so I think it's easier to get feedback from actual developers to see if they will be useful.