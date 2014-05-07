#include "Calculator.h"

#include <complex>
#include <vector>

complex_double add(complex_double x, complex_double y){
	complex_double cd;
	std::complex<double> std_cd = std::complex<double>(x.real, x.imaginary) + std::complex<double>(y.real, y.imaginary);
	cd.real = std_cd.real();
	cd.imaginary = std_cd.imag();
	return cd;
}

complex_double subtract(complex_double x, complex_double y){
	complex_double cd;
	std::complex<double> std_cd = std::complex<double>(x.real, x.imaginary) - std::complex<double>(y.real, y.imaginary);
	cd.real = std_cd.real();
	cd.imaginary = std_cd.imag();
	return cd;
}

complex_double multiply(complex_double x, complex_double y){
	complex_double cd;
	std::complex<double> std_cd = std::complex<double>(x.real, x.imaginary) * std::complex<double>(y.real, y.imaginary);
	cd.real = std_cd.real();
	cd.imaginary = std_cd.imag();
	return cd;
}

complex_double sum_all(std::vector<complex_double> contents){
	std::complex<double> currentSum(0,0);
	complex_double sum;
	for(std::vector<complex_double>::iterator it = contents.begin(); it != contents.end(); ++it) {
		complex_double current_cd = *it;
	    currentSum += std::complex<double>(current_cd.real, current_cd.imaginary);
	}
	sum.real = currentSum.real();
	sum.imaginary = currentSum.imag();
	return sum;
}


complex_double multiply_all(std::vector<complex_double> contents){
	std::complex<double> currentSum(1,0);
	complex_double sum;
	for(std::vector<complex_double>::iterator it = contents.begin(); it != contents.end(); ++it) {
		complex_double current_cd = *it;
	    currentSum *= std::complex<double>(current_cd.real, current_cd.imaginary);
	}
	sum.real = currentSum.real();
	sum.imaginary = currentSum.imag();
	return sum;
}


std::vector<double> map_abs(std::vector<complex_double> contents){
	std::vector<double> r;
	for(std::vector<complex_double>::iterator it = contents.begin(); it != contents.end(); ++it) {
		complex_double current_cd = *it;
	    r.push_back(abs(std::complex<double>(current_cd.real, current_cd.imaginary)));
	}
	return r;
}
