#include "Fib.h"
#include <stdio.h>
static Fib::MyClass s;

long Fib::fib(long x) {
	if (x==0){
		return 0;
	}

	if (x == 1){
		return 1;
	}

	return fib(x-1)+fib(x-2);
}

long Fib::countUp(){
	return s.inc();
}
