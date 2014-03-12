/*
 * LoggerInstance.h
 *
 *  Created on: 12 Mar 2014
 *      Author: meltuhamy
 */

#ifndef LOGGERINSTANCE_H_
#define LOGGERINSTANCE_H_

#include <ppapi/cpp/instance.h>
#include "../src/Logger.h"
#include "../../NaClRPCInstance.h"
class LoggerInstance: public NaClRPCInstance {
public:
	LoggerInstance(PP_Instance instance) : NaClRPCInstance(instance) {};
	virtual ~LoggerInstance(){};

	// Handle RPC method calls
	virtual void HandleRPC(std::string name, pp::VarArray params, int id);

};

#endif /* LOGGERINSTANCE_H_ */
