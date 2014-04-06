/*
 * LoggerModule.h
 *
 *  Created on: 12 Mar 2014
 *      Author: meltuhamy
 */

#ifndef LOGGERMODULE_H_
#define LOGGERMODULE_H_

#include <ppapi/cpp/module.h>

class LoggerModule: public pp::Module {
public:
	LoggerModule();
	virtual ~LoggerModule();
	virtual pp::Instance* CreateInstance(PP_Instance instance);
};

#endif /* LOGGERMODULE_H_ */
