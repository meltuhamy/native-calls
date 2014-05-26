#include "Benchmark.h"
#include "BenchTypes.h"
#include <vector>
#include <stdio.h>

#include "nativecalls/Bench.h"

int32_t bench_long( int32_t v){
	return v;
}

double bench_double( double v){
	return v;
}

std::string bench_DOMString( std::string v){
	return v;
}

dict bench_dict( dict v){
	return v;
}

nestedDict bench_nestedDict( nestedDict v){
	return v;
}

std::vector<int32_t> bench_seq_long( std::vector<int32_t> v){
	return v;
}

std::vector<double> bench_seq_double( std::vector<double> v){
	return v;
}

std::vector<std::string> bench_seq_DOMString( std::vector<std::string> v){
	return v;
}

std::vector<dict> bench_seq_dict( std::vector<dict> v){
	return v;
}

std::vector<nestedDict> bench_seq_nestedDict( std::vector<nestedDict> v){
	return v;
}

bool printSeperator( std::string tag){
	std::string t = "-----------" + tag + "-----------";
	pprpc::Bench::print(t);
	return true;
}
