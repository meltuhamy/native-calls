#include "Fib.h"

static Fib::MyClass s;

int Fib::fib(int x) {
	if (x == 0)
		return 0;

	if (x == 1)
		return 1;

	return fib(x-1)+fib(x-2);
}

int Fib::countUp(){
	return s.inc();
}
