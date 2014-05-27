#include "NaClAMBase.h"
#include "NaClAMMessageCollector.h"

#define STATE_CODE_WAITING_FOR_HEADER 0
#define STATE_CODE_COLLECTING_FRAMES 1

NaClAMMessageCollector::NaClAMMessageCollector() {
  _stateCode = -1;
  _framesLeft = -1;
  _messageReady = false;
}

NaClAMMessageCollector::~NaClAMMessageCollector() {

}

void NaClAMMessageCollector::Init() {
  _stateCode = STATE_CODE_WAITING_FOR_HEADER;
  _framesLeft = 0;
  _messageReady = false;
}

void NaClAMMessageCollector::Collect( PP_Var message ) {
  if (message.type == PP_VARTYPE_STRING) {
    HandleString(message);
  } else if (message.type == PP_VARTYPE_ARRAY_BUFFER) {
    HandleBuffer(message);
  }
  if (_stateCode == STATE_CODE_COLLECTING_FRAMES && _framesLeft == 0) {
    _stateCode = STATE_CODE_WAITING_FOR_HEADER;
    _messageReady = true;
  }
}

bool NaClAMMessageCollector::IsMessageReady() {
  return _messageReady;
}

NaClAMMessage NaClAMMessageCollector::GrabMessage() {
  _messageReady = false;
  return _preparedMessage;
}

void NaClAMMessageCollector::ClearMessage() {
  moduleInterfaces.var->Release(_preparedMessage.headerMessage);
  for (int i = 0; i < _preparedMessage.frameCount; i++) {
    moduleInterfaces.var->Release(_preparedMessage.frames[i]);
  }
  _preparedMessage.reset();
  _messageReady = false;
}

int NaClAMMessageCollector::ParseHeader(const char* str, uint32_t len) {
  if (len == 0) {
    return -1;
  }
  Json::Reader reader;
  bool r;
  r = reader.parse(str, str+len, _preparedMessage.headerRoot);
  if (r == false) {
    return -2;
  }
  Json::Value& root = _preparedMessage.headerRoot;
  if (root.isMember("cmd") == false) {
    NaClAMPrintf("NaCl AM Error: Header did not contain a cmd");
    return -3;
  }
  const Json::Value& cmd = root["cmd"];
  if (root.isMember("request") == false) {
    NaClAMPrintf("NaCl AM Error: Header cmd was not a string");
    return -4;
  }
  const Json::Value& request = root["request"];
  if (root.isMember("frames") == false) {
    NaClAMPrintf("NaCl AM Error: Header did not contain a frames");
    return -5;
  }
  const Json::Value& frames = root["frames"];
  _preparedMessage.requestId = request.asInt();
  _preparedMessage.cmdString = cmd.asString();
  return frames.asInt();
}

void NaClAMMessageCollector::HandleString(PP_Var message) {
  if (_stateCode == STATE_CODE_WAITING_FOR_HEADER) {
    uint32_t len = 0;
    const char* str = moduleInterfaces.var->VarToUtf8(message, &len);
    if (len == 0) {
      //messagePrintf("Received empty message.");
      return;
    }
    _preparedMessage.headerMessage = message;
    int frames = ParseHeader(str, len);
    _stateCode = STATE_CODE_COLLECTING_FRAMES;
    if (frames >= 0) {
      _framesLeft = frames;
    } else {
      NaClAMPrintf("Error parsing header: %d", frames);
      _framesLeft = 0;
    }
  } else if (_stateCode == STATE_CODE_COLLECTING_FRAMES) {
    _framesLeft--;
    _preparedMessage.AppendFrame(message);
  }
}

void NaClAMMessageCollector::HandleBuffer(PP_Var buffer) {
  if (_stateCode == STATE_CODE_COLLECTING_FRAMES) {
    _framesLeft--;
    _preparedMessage.AppendFrame(buffer);
  }
}

