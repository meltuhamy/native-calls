#include "include/Bench.h"
#include <map>
#include <stdio.h>
#include "ppapi/cpp/instance.h"
#include "ppapi/cpp/var.h"
#include <sstream>
namespace pprpc{
std::map<unsigned long long, std::string>* Bench::map = new std::map<unsigned long long, std::string>();

unsigned long long Bench::start(std::string tag){
	unsigned long long timestamp = Bench::microseconds();
	Bench::map->insert(std::pair<unsigned long long, std::string>(timestamp, tag));
	return timestamp;
}

unsigned long long Bench::end(unsigned long long startTime){
	unsigned long long timestamp = Bench::microseconds();
	// get startTime from map
	std::map<unsigned long long,std::string>::iterator it = Bench::map->find(startTime);
	if(it == Bench::map->end()){
		fprintf(stdout, "[%llu-%llu][%llu] undefined\n", startTime, timestamp, timestamp-startTime);
	} else {
		fprintf(stdout, "[%llu-%llu][%llu] %s\n", startTime, timestamp, timestamp-startTime, it->second.c_str());
	}
	return timestamp;
}

unsigned long long Bench::end(unsigned long long startTime, pp::Instance& instance){
	unsigned long long timestamp = Bench::microseconds();
	// get startTime from map
	std::map<unsigned long long,std::string>::iterator it = Bench::map->find(startTime);
	if(it == Bench::map->end()){
		std::stringstream message;
		message << "[" << startTime << "-" << timestamp << "][" << timestamp-startTime << "]" << std::endl;
		instance.PostMessage(message.str());
	} else {
		std::stringstream message;
		message << "[" << startTime << "-" << timestamp << "][" << timestamp-startTime << "] " << it->second;
		instance.PostMessage(message.str());
	}
	return timestamp;
}

unsigned long long Bench::print(std::string tag){
	unsigned long long timestamp = Bench::microseconds();
	fprintf(stdout, "[%llu] %s\n", timestamp, tag.c_str());
	return timestamp;
}


unsigned long long Bench::print(std::string tag, pp::Instance& instance){
	unsigned long long timestamp = Bench::microseconds();
	std::stringstream message;
	message << "[" << timestamp << "] " << tag << std::endl;
	instance.PostMessage(message.str());
	return timestamp;
}


unsigned long long Bench::microseconds() {
	struct timeval tv;
	gettimeofday(&tv, NULL);
	return tv.tv_sec * 1000000 + tv.tv_usec;
}


}

