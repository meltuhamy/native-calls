#include "Fib.h"
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

unsigned long countUp(){
	return s.inc();
}
