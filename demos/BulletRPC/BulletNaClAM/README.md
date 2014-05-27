NaClAMBase
==========

This is a modified version of https://github.com/johnmccutchan/NaClAMBase.
Please look there for more information.

I've removed a lot of extra stuff that I don't need.

Why?
----

* I'm using a prebuilt bullet from naclports, so I don't need an extra copy of
the bullet sources.

* I'm using the NaCl SDK Makefile to build everything, so I don't need Visual
  Studio or premake projects.

* I need to make some changes to the JavaScript to use in the NaCl SDK PNaCl /
  pepper.js demos.
