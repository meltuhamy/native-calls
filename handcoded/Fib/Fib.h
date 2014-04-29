#ifndef FIB_H_
#define FIB_H_

namespace Fib{
int fib(int x);
int countUp();

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
	int counter;
};

}


#endif /* FIB_H_ */
