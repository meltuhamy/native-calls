
all: .PHONY

.PHONY: project_code

MAKE_ARGS := TOOLCHAIN=$(TOOLCHAIN) CONFIG=$(CONFIG)

project_code:
	$(MAKE) -C Fib $(MAKE_ARGS)


clean:
	$(MAKE) -C Fib clean $(MAKE_ARGS)