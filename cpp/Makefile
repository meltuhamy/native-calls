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
PNACL_AR := $(PNACL_TC_PATH)/bin/pnacl-ar
PNACL_RANLIB := $(PNACL_TC_PATH)/bin/pnacl-ranlib

CXXFLAGS := -I$(NACL_SDK_ROOT)/include -I../include

#
# Disable DOS PATH warning when using Cygwin based tools Windows
#
CYGWIN ?= nodosfilewarning
export CYGWIN



# Declare the ALL target first, to make the 'all' target the default build
all: libnativecalls.a

clean:
	$(RM) *.o *.a

NaClRPCInstance.o: src/NaClRPCInstance.cpp
	$(PNACL_CXX) $(CXXFLAGS) src/NaClRPCInstance.cpp -c -o NaClRPCInstance.o -O0

libnativecalls.a: NaClRPCInstance.o
	$(PNACL_AR) cr libnativecalls.a NaClRPCInstance.o
	$(PNACL_RANLIB) libnativecalls.a

