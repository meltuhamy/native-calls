#ifndef BENCH_H_
#define BENCH_H_

#include <sys/time.h>
#include <string>
#include <map>
#include <stdio.h>

namespace pp{
class Instance;
}
namespace pprpc{

class Bench{
public:
	static unsigned long long start(std::string tag);
	static unsigned long long end(unsigned long long startTime);
	static unsigned long long end(unsigned long long startTime, pp::Instance& instance);
	static unsigned long long print(std::string tag);
	static unsigned long long print(std::string tag, pp::Instance& instance);
	static unsigned long long microseconds();
private:
	static std::map<unsigned long long, std::string>* map;

};


}

#endif /* BENCH_H_ */
