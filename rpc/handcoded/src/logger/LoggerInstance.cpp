/*
 * LoggerInstance.cpp
 *
 *  Created on: 12 Mar 2014
 *      Author: meltuhamy
 */

#include "LoggerInstance.h"
#include "ppapi/cpp/var.h"
#include "ppapi/cpp/var_array.h"
#include "ppapi/cpp/var_dictionary.h"
#include "Logger.h"
/**
 * Handle RPC calls
 */
void LoggerInstance::HandleRPC(std::string name, pp::VarArray params, int id) {
	if(name == "helloName"){
		// expecting 1 param with type string
		if(params.GetLength() == 1){
			pp::Var firstParam = params.Get(0);
			if(firstParam.is_string()){
				std::string result = helloName(firstParam.AsString());
				// Now do a callback
				pp::Var responseData = pp::Var(result);
				PostMessage(*ConstructResponseDictionary(id, responseData));
			}
		}
	} else if(name == "greetName"){
		// expecting 2 params with type string
		if(params.GetLength() == 2){
			pp::Var firstParam = params.Get(0);
			pp::Var secondParam = params.Get(1);
			if(firstParam.is_string() && secondParam.is_string()){
				std::string result = greetName(firstParam.AsString(), secondParam.AsString());
				// Now do a callback
				pp::Var responseData = pp::Var(result);
				PostMessage(*ConstructResponseDictionary(id, responseData));
			}
		}
	}
}
