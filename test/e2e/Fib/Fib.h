#ifndef FIB_H_
#define FIB_H_

namespace Fib{
long fib(long x);
long countUp();

class MyClass{
public:
	MyClass(){
		counter = 0;
	}

	virtual ~MyClass(){

	}

	int inc(){
		return counter++;
	}

private:
	long counter;
};

}


#endif /* FIB_H_ */
