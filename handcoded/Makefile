
all: .PHONY

.PHONY: project_code

project_code:
	$(MAKE) -C Logger TOOLCHAIN=$(TOOLCHAIN)
	$(MAKE) -C Fib TOOLCHAIN=$(TOOLCHAIN)
	$(MAKE) -C ObjectsExample TOOLCHAIN=$(TOOLCHAIN)


clean:
	$(MAKE) -C Logger clean
	$(MAKE) -C Fib clean
	$(MAKE) -C ObjectsExample clean