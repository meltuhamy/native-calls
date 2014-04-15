THIS_MAKEFILE := $(abspath $(lastword $(MAKEFILE_LIST)))
NACL_SDK_ROOT ?= $(abspath $(dir $(THIS_MAKEFILE))../..)

# Project Build flags
WARNINGS := -Wno-long-long -Wall -Wswitch-enum -pedantic -Werror
CXXFLAGS := -pthread -std=gnu++98 $(WARNINGS)

# we need to make all the different versions of this library.
# newlib 64, newlib 32, glibc 64, glibc 32, pnacl


GETOS := python $(NACL_SDK_ROOT)/tools/getos.py
OSHELPERS = python $(NACL_SDK_ROOT)/tools/oshelpers.py
OSNAME := $(shell $(GETOS))
RM := $(OSHELPERS) rm

TC_PATH_NEWLIB = $(abspath $(NACL_SDK_ROOT)/toolchain/$(OSNAME)_x86_newlib)
TC_PATH_GLIBC = $(abspath $(NACL_SDK_ROOT)/toolchain/$(OSNAME)_x86_glibc)
TC_PATH_PNACL = $(abspath $(NACL_SDK_ROOT)/toolchain/$(OSNAME)_pnacl)

CXX_NEWLIB_32 = $(TC_PATH_NEWLIB)/bin/i686-nacl-g++
CXX_NEWLIB_64 = $(TC_PATH_NEWLIB)/bin/x86_64-nacl-g++
CXX_GLIBC_32 = $(TC_PATH_GLIBC)/bin/i686-nacl-g++
CXX_GLIBC_64 = $(TC_PATH_GLIBC)/bin/x86_64-nacl-g++
CXX_PNACL = $(TC_PATH_PNACL)/bin/pnacl-clang++

AR_NEWLIB_32 = $(TC_PATH_NEWLIB)/bin/i686-nacl-ar
AR_NEWLIB_64 = $(TC_PATH_NEWLIB)/bin/x86_64-nacl-ar
AR_GLIBC_32 = $(TC_PATH_GLIBC)/bin/i686-nacl-ar
AR_GLIBC_64 = $(TC_PATH_GLIBC)/bin/x86_64-nacl-ar
AR_PNACL = $(TC_PATH_PNACL)/bin/pnacl-ar

RANLIB_NEWLIB_32 = $(TC_PATH_NEWLIB)/bin/i686-nacl-ranlib
RANLIB_NEWLIB_64 = $(TC_PATH_NEWLIB)/bin/x86_64-nacl-ranlib
RANLIB_GLIBC_32 = $(TC_PATH_GLIBC)/bin/i686-nacl-ranlib
RANLIB_GLIBC_64 = $(TC_PATH_GLIBC)/bin/x86_64-nacl-ranlib
RANLIB_PNACL = $(TC_PATH_PNACL)/bin/pnacl-ranlib

CXXFLAGS := -I$(NACL_SDK_ROOT)/include -I../include

#
# Disable DOS PATH warning when using Cygwin based tools Windows
#
CYGWIN ?= nodosfilewarning
export CYGWIN



# Declare the ALL target first, to make the 'all' target the default build
all: libnativecalls_newlib_32.a libnativecalls_newlib_64.a libnativecalls_glibc_32.a libnativecalls_glibc_64.a libnativecalls_pnacl.a

clean:
	$(RM) *.o *.a

NaClRPCInstance_newlib_32.o: src/NaClRPCInstance.cpp
	$(CXX_NEWLIB_32) $(CXXFLAGS) $< -c -o $@ -O0

NaClRPCInstance_newlib_64.o: src/NaClRPCInstance.cpp
	$(CXX_NEWLIB_64) $(CXXFLAGS) $< -c -o $@ -O0

NaClRPCInstance_glibc_32.o: src/NaClRPCInstance.cpp
	$(CXX_GLIBC_32) $(CXXFLAGS) $< -c -o $@ -O0

NaClRPCInstance_glibc_64.o: src/NaClRPCInstance.cpp
	$(CXX_GLIBC_64) $(CXXFLAGS) $< -c -o $@ -O0

NaClRPCInstance_pnacl.o: src/NaClRPCInstance.cpp
	$(CXX_PNACL) $(CXXFLAGS) $< -c -o $@ -O0


libnativecalls_newlib_32.a: NaClRPCInstance_newlib_32.o
	$(AR_NEWLIB_32) cr $@ $<
	$(RANLIB_NEWLIB_32) $@

libnativecalls_newlib_64.a: NaClRPCInstance_newlib_64.o
	$(AR_NEWLIB_64) cr $@ $<
	$(RANLIB_NEWLIB_64) $@

libnativecalls_glibc_32.a: NaClRPCInstance_glibc_32.o
	$(AR_GLIBC_32) cr $@ $<
	$(RANLIB_GLIBC_32) $@

libnativecalls_glibc_64.a: NaClRPCInstance_glibc_64.o
	$(AR_GLIBC_64) cr $@ $<
	$(RANLIB_GLIBC_64) $@

libnativecalls_pnacl.a: NaClRPCInstance_pnacl.o
	$(AR_PNACL) cr $@ $<
	$(RANLIB_PNACL) $@
