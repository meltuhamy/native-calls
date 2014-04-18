# Copyright (c) 2013 The Native Client Authors. All rights reserved.
# Use of this source code is governed by a BSD-style license that can be
# found in the LICENSE file.

#
# GNU Make based build file. ������For details on GNU Make see:
# http://www.gnu.org/software/make/manual/make.html
#

#
# Get pepper directory for toolchain and includes.
#
# If NACL_SDK_ROOT is not set, then assume it can be found three directories up.
#
THIS_MAKEFILE := $(abspath $(lastword $(MAKEFILE_LIST)))
NACL_SDK_ROOT ?= $(abspath $(dir $(THIS_MAKEFILE))../..)

CPP_PATH := $(abspath $(dir $(THIS_MAKEFILE))../../cpp)

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

TC_PATH := $(abspath $(NACL_SDK_ROOT)/toolchain/$(OSNAME)_x86_newlib)
TC_CXX := $(TC_PATH)/bin/i686-nacl-g++
# TC_FIN := $(TC_PATH)/bin/pnacl-finalize # don't need this when not pnacl

# include nacl libraries and our NaClRPC libraries
CXXFLAGS := -I$(NACL_SDK_ROOT)/include -I$(CPP_PATH)/include
LDFLAGS := -L$(NACL_SDK_ROOT)/lib/newlib_x86_32/Release -L$(CPP_PATH) -lnativecalls_newlib_32 -lppapi_simple -lnacl_io -lppapi_cpp -lppapi -lgtest

#
# Disable DOS PATH warning when using Cygwin based tools Windows
#
CYGWIN ?= nodosfilewarning
export CYGWIN


# Declare the ALL target first, to make the 'all' target the default build
all: testing.nexe

clean:
	$(RM) -f *.pexe *.bc *.nexe

testing.nexe: *.cpp cases/*.cpp
	$(TC_CXX) -o $@ testing.cpp -O0 $(CXXFLAGS) $(LDFLAGS)


#
# Makefile target to run the SDK's simple HTTP server and serve this example.
#
HTTPD_PY := python $(NACL_SDK_ROOT)/tools/httpd.py

.PHONY: serve
serve: all
	$(HTTPD_PY) -C $(CURDIR)
