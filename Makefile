# Warning: setting these might break the tests, which currently have hardcoded links:
# You'll need to change the files below to fix this: 
### test/CPPTestsSpec.js - Change the testingModule src.
### scripts/NaClConfig.js - Change the CONFIG and TOOLCHAIN properties.


TOOLCHAIN ?= newlib
CONFIG ?= Debug
ARCH ?= x86_32

ifneq ($(TOOLCHAIN),pnacl)
ifneq ($(MAKECMDGOALS),hardclean)
ifneq ($(TOOLCHAIN),all)
NACL_ARCH ?= $(ARCH)
$(info Exporting NACL_ARCH=$(NACL_ARCH))
export NACL_ARCH 
endif
endif
endif


export TOOLCHAIN
export CONFIG


mkfile_path = $(abspath $(lastword $(MAKEFILE_LIST)))
current_dir = $(patsubst %/,%,$(dir $(mkfile_path)))

RPCLIB_DIR = cpp
TEST_CODE_DIR = test/cpp
EETEST_CODE_DIR = test/e2e

# Used to pipe stdout. useful for gtest output.
NACL_EXE_STDOUT ?= ${current_dir}/nacl_std_out.log

# Used to easily run npm module binaries (e.g. karma)
NM_BIN_PATH := ${current_dir}/node_modules/.bin 

all: .PHONY

.PHONY: libs tests eetests

# anything that needs an npm module will need to install packages
$(NM_BIN_PATH):
	npm install

# Make each part

libs: 
	$(MAKE) -C $(RPCLIB_DIR)

tests: libs
	$(MAKE) -C $(TEST_CODE_DIR)

eetests: libs
	$(MAKE) -C $(EETEST_CODE_DIR)

# Use this to re-link tests with the libraries
rebuildtests: libs
	$(MAKE) -C $(TEST_CODE_DIR) FORCE=y

rebuildee: libs
	$(MAKE) -C $(EETEST_CODE_DIR) FORCE=y


# cleaning

cleanlib:
	$(MAKE) -C $(RPCLIB_DIR) clean

cleantest:
	$(MAKE) -C $(TEST_CODE_DIR) clean

cleanee:
	$(MAKE) -C $(EETEST_CODE_DIR) clean


clean: cleantest cleanlib cleanlib cleanee
cleanbuild: clean all

# hard clean cleans ALL TOOLCHAIN builds and also for both Release and Debug.
hardclean:
	$(MAKE) clean TOOLCHAIN=all CONFIG=Release
	$(MAKE) clean TOOLCHAIN=all CONFIG=Debug

# testing
test: nodetest jstest cpptest eetest

nodetest: $(NM_BIN_PATH)
	@echo "\n\n** RUNNING NODE.JS TESTS **\n\n"
	@npm run nodetest

cpptest: libs tests $(NM_BIN_PATH)
	@echo "\n\n** RUNNING C++ TESTS **\n\n"
	@touch $(NACL_EXE_STDOUT)
	@export NACL_EXE_STDOUT="$(NACL_EXE_STDOUT)" ; tail -n 0 -f $(NACL_EXE_STDOUT) & TAILPID=$$! && npm run cpptest ; kill $$TAILPID

eetest: libs eetests $(NM_BIN_PATH)
	@echo "\n\n** RUNNING E2E TESTS **\n\n"
	@touch $(NACL_EXE_STDOUT)
	@export NACL_EXE_STDOUT="$(NACL_EXE_STDOUT)" ; tail -n 0 -f $(NACL_EXE_STDOUT) & TAILPID=$$! && npm run eetest ; kill $$TAILPID



jstest: $(NM_BIN_PATH)
	@echo "\n\n** RUNNING JAVASCRIPT TESTS **\n\n"
	@npm run jstest

jswatch: $(NM_BIN_PATH)
	@npm run jswatch

# running
serve: $(NM_BIN_PATH)
	@npm run serve
	