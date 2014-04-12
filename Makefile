mkfile_path = $(abspath $(lastword $(MAKEFILE_LIST)))
current_dir = $(patsubst %/,%,$(dir $(mkfile_path)))

HANDCODED_DIR = handcoded
TEST_CODE_DIR = test/cpp
NACL_EXE_STDOUT ?= ${current_dir}/nacl_std_out.log

all: .PHONY

.PHONY: project_code

project_code:
	$(MAKE) -C $(HANDCODED_DIR)

test_code:
	$(MAKE) -C $(TEST_CODE_DIR)

clean:
	$(MAKE) -C $(HANDCODED_DIR) clean

serve:
	npm run serve

test: project_code test_code
	npm install
	touch $(NACL_EXE_STDOUT)
	export NACL_EXE_STDOUT="$(NACL_EXE_STDOUT)" ; tail -n 0 -f $(NACL_EXE_STDOUT) & TAILPID=$$! && npm test ; kill $$TAILPID