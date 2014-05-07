#ifndef CALCULATOR_H_
#define CALCULATOR_H_

#include "ComplexTypes.h"

#include <vector>

complex_double add(complex_double x, complex_double y);
complex_double subtract(complex_double x, complex_double y);
complex_double multiply(complex_double x, complex_double y);

complex_double sum_all(std::vector<complex_double> contents);
complex_double multiply_all(std::vector<complex_double> contents);

#endif /* CALCULATOR_H_ */
