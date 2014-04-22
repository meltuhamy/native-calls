VALID_TOOLCHAINS ?= newlib glibc pnacl

###
### NOTE: Changing CONFIG and TOOLCHAIN will require you to change the following files
### test/CPPTestsSpec.js - Change the testingModule src.
### scripts/NaClConfig.js - Change the CONFIG and TOOLCHAIN properties.
###
CONFIG ?= Debug
TOOLCHAIN ?= newlib


mkfile_path = $(abspath $(lastword $(MAKEFILE_LIST)))
current_dir = $(patsubst %/,%,$(dir $(mkfile_path)))

RPCLIB_DIR = cpp
DEMOS_DIR = handcoded
TEST_CODE_DIR = test/cpp

# Used to pipe stdout. useful for gtest output.
NACL_EXE_STDOUT ?= ${current_dir}/nacl_std_out.log

# Used to easily run npm module binaries (e.g. karma)
NM_BIN_PATH := ${current_dir}/node_modules/.bin 

# Pass the arguments on to other Makefiles
MAKE_ARGS := TOOLCHAIN=$(TOOLCHAIN) CONFIG=$(CONFIG)

all: .PHONY

.PHONY: libs demos tests

# anything that needs an npm module will need to install packages
$(NM_BIN_PATH):
	npm install

# Make each part

libs: 
	$(MAKE) -C $(RPCLIB_DIR) $(MAKE_ARGS)

demos: libs
	$(MAKE) -C $(DEMOS_DIR) $(MAKE_ARGS)

tests: libs
	$(MAKE) -C $(TEST_CODE_DIR) $(MAKE_ARGS) ARCH=$(ARCH)

# Use this to re-link tests with the libraries
rebuildtests: libs
	$(MAKE) -C $(TEST_CODE_DIR) $(MAKE_ARGS) FORCE=y

# cleaning

cleandemo:
	$(MAKE) -C $(DEMOS_DIR) clean $(MAKE_ARGS)

cleanlib:
	$(MAKE) -C $(RPCLIB_DIR) clean $(MAKE_ARGS)

cleantest:
	$(MAKE) -C $(TEST_CODE_DIR) clean $(MAKE_ARGS)

cleantestkeepnmf:
	$(MAKE) -C $(TEST_CODE_DIR) clean $(MAKE_ARGS) KEEPNMF=Y


clean: cleantest cleanlib cleandemo
cleanbuild: clean all

# hard clean cleans ALL TOOLCHAIN builds and also for both Release and Debug.
hardclean:
	$(MAKE) clean TOOLCHAIN=all CONFIG=Release
	$(MAKE) clean TOOLCHAIN=all CONFIG=Debug

# testing
test: nodetest jstest cpptest

nodetest: $(NM_BIN_PATH)
	npm run nodetest

cpptest: libs tests $(NM_BIN_PATH)
	touch $(NACL_EXE_STDOUT)
	export NACL_EXE_STDOUT="$(NACL_EXE_STDOUT)" ; tail -n 0 -f $(NACL_EXE_STDOUT) & TAILPID=$$! && npm run cpptest ; kill $$TAILPID

cppwatch: libs tests $(NM_BIN_PATH)
	touch $(NACL_EXE_STDOUT)
	export NACL_EXE_STDOUT="$(NACL_EXE_STDOUT)" ; tail -n 0 -f $(NACL_EXE_STDOUT) & TAILPID=$$! && npm run cppwatch ; kill $$TAILPID


jstest: $(NM_BIN_PATH)
	npm run jstest

jswatch: $(NM_BIN_PATH)
	npm run jswatch

# running
serve: $(NM_BIN_PATH)
	npm run serve
	