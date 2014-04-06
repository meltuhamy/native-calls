/*
 * LoggerModule.cpp
 *
 *  Created on: 12 Mar 2014
 *      Author: meltuhamy
 */

#include "LoggerInstance.h"
#include "LoggerModule.h"

LoggerModule::LoggerModule() {
	// TODO Auto-generated constructor stub

}

LoggerModule::~LoggerModule() {
	// TODO Auto-generated destructor stub
}

pp::Instance* LoggerModule::CreateInstance(PP_Instance instance){
	return new LoggerInstance(instance);
}


namespace pp {
// Every module must implement a factory method
Module* CreateModule() {
  return new LoggerModule();
}
}  // namespace pp
