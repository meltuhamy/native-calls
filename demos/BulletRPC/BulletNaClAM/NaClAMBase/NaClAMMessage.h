#pragma once

#include <string>
#include "json/json.h"

#define MAX_FRAMES 16
struct NaClAMMessage {
  Json::Value headerRoot;
  std::string cmdString;
  int requestId;
  PP_Var headerMessage;
  PP_Var frames[MAX_FRAMES];
  int frameCount;

  NaClAMMessage() {
    frameCount = 0;
    cmdString = "";
    headerRoot.clear();
  }

  void reset() {
    frameCount = 0;
    cmdString = "";
    headerRoot.clear();
  }

  void AppendFrame(PP_Var frame) {   
    frames[frameCount] = frame;
    frameCount++;
  }
};