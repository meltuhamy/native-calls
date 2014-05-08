all: .PHONY

# Todo, fix this so we don't have to compile everything every time!

PACKAGES := Fib Complex


mkfile_path := $(dir $(abspath $(lastword $(MAKEFILE_LIST))))

.PHONY: $(PACKAGES)

clean:
	rm -rf $(PACKAGES)

Fib_Imps := $(wildcard Fib_Implementation/*.idl)
Fib: $(Fib_Imps)
	@echo Removing folder $@
	@rm -rf $@
	@echo Generating package $@
	@node ../../generator/generator-cli.js --package=$@ $^
	ln -s $(wildcard $(mkfile_path)$@_Implementation/*) $@/
	$(MAKE) -C $@

Complex_Imps := $(wildcard Complex_Implementation/*.idl)
Complex: $(Complex_Imps)
	@echo Removing folder $@
	@rm -rf $@
	@echo Generating package $@
	@node ../../generator/generator-cli.js --package=$@ $^
	ln -s $(wildcard $(mkfile_path)$@_Implementation/*) $@/
	$(MAKE) -C $@

