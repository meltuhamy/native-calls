#include "Fib.h"
#include "RPCType.h"
#include <stdio.h>
class MyClass{
public:
	MyClass(){
		counter = 0;
	}

	virtual ~MyClass(){

	}

	uint32_t inc(){
		return counter++;
	}

private:
	uint32_t counter;
};

static MyClass s;

uint32_t fib(uint32_t x) {
	if (x==0){
		return 0;
	}

	if (x == 1){
		return 1;
	}

	return fib(x-1)+fib(x-2);
}

uint32_t throwingFib(int32_t x, pprpc::RPCError& error){
	if(x < 0){
		error.init(-1, "Can't find negative fib number!", "");
		return 0;
	}
	return fib((uint32_t) x);
}

uint32_t countUp(){
	return s.inc();
}
