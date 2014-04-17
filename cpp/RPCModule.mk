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


#
# Compute tool paths
#
TOOLCHAIN ?= pnacl
ARCH ?= 64
COMPILER ?= g++

# LIBPATH is one of 5: glibc_x86_32,  glibc_x86_64, newlib_x86_32,  newlib_x86_64,  pnacl
RELASEDEBUG = Release
LIBPATH := -L$(NACL_SDK_ROOT)/lib/$(TOOLCHAIN)
RPCLIBNAME := nativecalls_
PNEXE := pexe

# pnacl is architecture independent. Others are.
TOOLPREFIX = $(TOOLCHAIN)
TOOLFOLDER = $(TOOLCHAIN)
ifeq ($(TOOLCHAIN),pnacl)
COMPILER = clang++
LIBPATH := $(LIBPATH)/$(RELASEDEBUG)
RPCLIBNAME := $(RPCLIBNAME)pnacl
PNEXE := pexe
else
LIBPATH := $(LIBPATH)_x86_$(ARCH)/$(RELASEDEBUG)
RPCLIBNAME := $(RPCLIBNAME)$(TOOLCHAIN)_$(ARCH)
TOOLFOLDER = x86_$(TOOLCHAIN)
PNEXE := nexe
ifeq ($(ARCH),32)
#32 bit
TOOLPREFIX = i686-nacl
else
#64 bit
TOOLPREFIX = x86_64-nacl
endif
endif

# at this point the following variables are set:
# TOOLCHAIN: either pnacl, newlib, or glibc
# ARCH: either 64 or 32
# TOOLPREFIX: either pnacl, i686-nacl, or x86_64-nacl
# COMPILER: either clang++ or g++
# TOOLFOLDER: either pnacl, x86_newlib, or x86_glibc

GETOS := python $(NACL_SDK_ROOT)/tools/getos.py
OSHELPERS = python $(NACL_SDK_ROOT)/tools/oshelpers.py
OSNAME := $(shell $(GETOS))
RM := $(OSHELPERS) rm
CREATE_NMF = python $(NACL_SDK_ROOT)/tools/create_nmf.py


TC_PATH := $(abspath $(NACL_SDK_ROOT)/toolchain/$(OSNAME)_$(TOOLFOLDER))
ARCH_CXX := $(TC_PATH)/bin/$(TOOLPREFIX)-$(COMPILER)
PNACL_FINALIZE := $(TC_PATH)/bin/$(TOOLPREFIX)-finalize


CXXFLAGS := -I$(RPCINSTANCE)include -I$(NACL_SDK_ROOT)/include

LDFLAGS := -L$(RPCINSTANCE) $(LIBPATH) -l$(RPCLIBNAME) -lppapi_cpp -lppapi

CYGWIN ?= nodosfilewarning
export CYGWIN

all: $(THIS_FOLDERNAME).nmf

clean:
	$(RM) -f *.bc *.pexe *.nexe *.nmf

$(THIS_FOLDERNAME).bc: *.cpp
	$(ARCH_CXX) -o $@ $^ -O0 $(CXXFLAGS) $(LDFLAGS)

$(THIS_FOLDERNAME).$(PNEXE): $(THIS_FOLDERNAME).bc
	if [ "$(TOOLCHAIN)" == "pnacl" ] ; then $(PNACL_FINALIZE) -o $@ $< ; else cp $< $@ ; fi

$(THIS_FOLDERNAME).nmf: $(THIS_FOLDERNAME).$(PNEXE)
	$(CREATE_NMF) -o $@ $<

