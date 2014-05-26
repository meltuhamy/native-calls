all: Bench

mkfile_path := $(dir $(abspath $(lastword $(MAKEFILE_LIST))))

clean:
	rm -rf Bench

Bench: Bench.idl
	rm -rf $@
	@../../generator/pprpcgen.js --package=$@ $^
	ln -s $(wildcard $(mkfile_path)src/Benchmark.cpp) $@/Benchmark.cpp
	$(MAKE) -C $@
