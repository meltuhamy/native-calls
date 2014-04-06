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
	if(name == "Echo"){
		// expecting 1 param with type string
		if(params.GetLength() == 1){
			pp::Var firstParam = params.Get(0);
			if(firstParam.is_string()){
				std::string result = Echo(firstParam.AsString());
				// Now do a callback
				pp::Var responseData = pp::Var(result);
				PostMessage(*ConstructResponseDictionary(id, responseData));
			}
		}
	}
}
