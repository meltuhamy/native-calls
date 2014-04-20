
all: .PHONY

.PHONY: project_code

MAKE_ARGS := TOOLCHAIN=$(TOOLCHAIN) CONFIG=$(CONFIG)

project_code:
	$(MAKE) -C Logger $(MAKE_ARGS)
	$(MAKE) -C Fib $(MAKE_ARGS)
	$(MAKE) -C ObjectsExample $(MAKE_ARGS)


clean:
	$(MAKE) -C Logger clean $(MAKE_ARGS)
	$(MAKE) -C Fib clean $(MAKE_ARGS)
	$(MAKE) -C ObjectsExample clean $(MAKE_ARGS)