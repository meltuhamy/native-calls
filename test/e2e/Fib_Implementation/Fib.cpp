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

	unsigned long inc(){
		return counter++;
	}

private:
	unsigned long counter;
};

static MyClass s;

unsigned long fib(unsigned long x) {
	if (x==0){
		return 0;
	}

	if (x == 1){
		return 1;
	}

	return fib(x-1)+fib(x-2);
}

unsigned long throwingFib(long x, pprpc::RPCError& error){
	if(x < 0){
		error.init(-1, "Can't find negative fib number!", "");
		return 0;
	}
	return fib((unsigned long) x);
}

unsigned long countUp(){
	return s.inc();
}
