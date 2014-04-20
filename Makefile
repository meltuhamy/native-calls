VALID_TOOLCHAINS ?= newlib glibc pnacl
TOOLCHAIN ?= newlib
mkfile_path = $(abspath $(lastword $(MAKEFILE_LIST)))
current_dir = $(patsubst %/,%,$(dir $(mkfile_path)))

RPCLIB_DIR = cpp
DEMOS_DIR = handcoded
TEST_CODE_DIR = test/cpp
NACL_EXE_STDOUT ?= ${current_dir}/nacl_std_out.log

NM_BIN_PATH := ${current_dir}/node_modules/.bin 

all: .PHONY

.PHONY: libs demos tests

$(NM_BIN_PATH):
	npm install

# making

libs: 
	$(MAKE) -C $(RPCLIB_DIR) TOOLCHAIN=$(TOOLCHAIN)

demos: libs
	$(MAKE) -C $(DEMOS_DIR) TOOLCHAIN=$(TOOLCHAIN)

tests: libs
	$(MAKE) -C $(TEST_CODE_DIR) TOOLCHAIN=$(TOOLCHAIN) ARCH=$(ARCH)

rebuildtests: libs cleantest tests


# cleaning

cleandemo:
	$(MAKE) -C $(DEMOS_DIR) clean TOOLCHAIN=all

cleanlib:
	$(MAKE) -C $(RPCLIB_DIR) clean TOOLCHAIN=all

cleantest:
	$(MAKE) -C $(TEST_CODE_DIR) clean TOOLCHAIN=all


clean: cleantest cleanlib cleandemo
cleanbuild: clean all


# testing
test: libs tests $(NM_BIN_PATH)
	touch $(NACL_EXE_STDOUT)
	export NACL_EXE_STDOUT="$(NACL_EXE_STDOUT)" ; tail -n 0 -f $(NACL_EXE_STDOUT) & TAILPID=$$! && npm test ; kill $$TAILPID

nodetest: $(NM_BIN_PATH)
	npm run nodetest


# running
serve: $(NM_BIN_PATH)
	npm run serve
	