# This makefile is generic and can be included directly without worrying about filenames
# Using the folder name, it will generate the .pexe, .nmf, and .js files automatically.

RPCINSTANCE := $(dir $(abspath $(lastword $(MAKEFILE_LIST))))

# You need to set the THIS_MAKEFILE variable before including this file.
# You can copy the line below to the folder.
# THIS_MAKEFILE := $(abspath $(lastword $(MAKEFILE_LIST)))
THIS_FOLDERNAME := $(shell basename $(dir $(THIS_MAKEFILE)))

WARNINGS := -Wno-long-long -Wall -Wswitch-enum -pedantic -Werror
CXXFLAGS := -pthread -std=gnu++98 $(WARNINGS)


GETOS := python $(NACL_SDK_ROOT)/tools/getos.py
OSHELPERS = python $(NACL_SDK_ROOT)/tools/oshelpers.py
CREATE_NMF = python $(NACL_SDK_ROOT)/tools/create_nmf.py
OSNAME := $(shell $(GETOS))
RM := $(OSHELPERS) rm

PNACL_TC_PATH := $(abspath $(NACL_SDK_ROOT)/toolchain/$(OSNAME)_pnacl)
PNACL_CXX := $(PNACL_TC_PATH)/bin/pnacl-clang++

CXXFLAGS := -I$(RPCINSTANCE)include -I$(NACL_SDK_ROOT)/include

LDFLAGS := -L$(RPCINSTANCE) -L$(NACL_SDK_ROOT)/lib/pnacl/Release -lnativecalls -lppapi_cpp -lppapi

CYGWIN ?= nodosfilewarning
export CYGWIN

all: $(THIS_FOLDERNAME)RPC.js

clean:
	$(RM) -f *.pexe *.js *.nmf

$(THIS_FOLDERNAME).pexe: *.cpp
	$(PNACL_CXX) -o $@ $^ -O0 $(CXXFLAGS) $(LDFLAGS)

$(THIS_FOLDERNAME).nmf: $(THIS_FOLDERNAME).pexe
	$(CREATE_NMF) -o $@ $<

$(THIS_FOLDERNAME)RPC.js: $(THIS_FOLDERNAME).nmf $(THIS_FOLDERNAME).idl 
	# todo: generate js
