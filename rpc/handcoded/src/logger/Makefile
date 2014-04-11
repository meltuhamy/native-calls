RPCINSTANCE = ../NaClRPCInstance

# Get pepper directory for toolchain and includes.
#
# If NACL_SDK_ROOT is not set, then assume it can be found three directories up.
#
THIS_MAKEFILE := $(abspath $(lastword $(MAKEFILE_LIST)))
NACL_SDK_ROOT ?= $(abspath $(dir $(THIS_MAKEFILE))../..)

# Project Build flags
WARNINGS := -Wno-long-long -Wall -Wswitch-enum -pedantic -Werror
CXXFLAGS := -pthread -std=gnu++98 $(WARNINGS)

#
# Compute tool paths
#
GETOS := python $(NACL_SDK_ROOT)/tools/getos.py
OSHELPERS = python $(NACL_SDK_ROOT)/tools/oshelpers.py
OSNAME := $(shell $(GETOS))
RM := $(OSHELPERS) rm

PNACL_TC_PATH := $(abspath $(NACL_SDK_ROOT)/toolchain/$(OSNAME)_pnacl)
PNACL_CXX := $(PNACL_TC_PATH)/bin/pnacl-clang++
PNACL_FINALIZE := $(PNACL_TC_PATH)/bin/pnacl-finalize
CXXFLAGS := -I$(NACL_SDK_ROOT)/include -I$(RPCINSTANCE)
LDFLAGS := -L$(NACL_SDK_ROOT)/lib/pnacl/Release -lppapi_cpp -lppapi

#
# Disable DOS PATH warning when using Cygwin based tools Windows
#
CYGWIN ?= nodosfilewarning
export CYGWIN



# Declare the ALL target first, to make the 'all' target the default build
all: LoggerModule

clean:
	$(RM) *.pexe *.bc *.js

Logger.bc: $(RPCINSTANCE)/*.cpp *.cpp
	$(PNACL_CXX) -o $@ $(RPCINSTANCE)/*.cpp *.cpp -O2 $(CXXFLAGS) $(LDFLAGS)

Logger.pexe: Logger.bc
	$(PNACL_FINALIZE) -o $@ $<

LoggerModule: Logger.idl Logger.pexe
	../../../../idl_parser/idl_js_generator.py Logger.idl > LoggerRPCModule.js
#
# Makefile target to run the SDK's simple HTTP server and serve this example.
#
HTTPD_PY := python $(NACL_SDK_ROOT)/tools/httpd.py

.PHONY: serve
serve: all
	$(HTTPD_PY) -C $(CURDIR)
