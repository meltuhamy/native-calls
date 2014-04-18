mkfile_path = $(abspath $(lastword $(MAKEFILE_LIST)))
current_dir = $(patsubst %/,%,$(dir $(mkfile_path)))

CPPDIR = cpp
HANDCODED_DIR = handcoded
TEST_CODE_DIR = test/cpp
NACL_EXE_STDOUT ?= ${current_dir}/nacl_std_out.log

NM_BIN_PATH := ${current_dir}/node_modules/.bin 

all: .PHONY

.PHONY: project_code test_code

$(NM_BIN_PATH):
	npm install

project_code: $(NM_BIN_PATH)
	$(MAKE) -C $(CPPDIR)
	$(MAKE) -C $(HANDCODED_DIR)

test_code:
	$(MAKE) -C $(TEST_CODE_DIR)

clean:
	$(MAKE) -C $(HANDCODED_DIR) clean
	$(MAKE) -C $(CPPDIR) clean

serve: $(NM_BIN_PATH)
	npm run serve

test: project_code test_code $(NM_BIN_PATH)
	touch $(NACL_EXE_STDOUT)
	export NACL_EXE_STDOUT="$(NACL_EXE_STDOUT)" ; tail -n 0 -f $(NACL_EXE_STDOUT) & TAILPID=$$! && npm test ; kill $$TAILPID

nodetest: $(NM_BIN_PATH)
	npm run nodetest
