#include <cstdarg>
#include <cstdio>
#include <cstring>
#include <cstdlib>
#include <pthread.h>
#include <string>
#include "ppapi/c/pp_errors.h"
#include "ppapi/c/pp_module.h"
#include "ppapi/c/pp_var.h"
#include "ppapi/c/ppp.h"
#include "ppapi/c/ppp_instance.h"
#include "ppapi/c/ppp_messaging.h"
#include "ppapi/c/ppp_input_event.h"
#include <sys/time.h>
#include "json/json.h"
#include "NaClAMBase.h"
#include "NaClAMMessageCollector.h"

ModuleInterfaces moduleInterfaces;
PP_Instance moduleInstance = 0;
NaClAMMessageCollector messageCollector;

static uint64_t microseconds() {
  struct timeval tv;
  gettimeofday(&tv, NULL);
  return tv.tv_sec * 1000000 + tv.tv_usec;
}


Json::Value NaClAMMakeReplyObject(std::string cmd, int requestId) {
  Json::Value root;
  root["cmd"] = Json::Value(cmd);
  root["request"] = Json::Value(requestId);
  return root;
}

void NaClAMSendMessage(const PP_Var& header, const PP_Var* frames, uint32_t numFrames) {
  if (moduleInterfaces.messaging != NULL && moduleInstance != 0) {
    moduleInterfaces.messaging->PostMessage(moduleInstance, header);
    for (uint32_t i = 0; i < numFrames; i++) {
      moduleInterfaces.messaging->PostMessage(moduleInstance, frames[i]);
    }
  }
}

void NaClAMSendMessage(const Json::Value& header, const PP_Var* frames, uint32_t numFrames) {
  Json::StyledWriter writer;
  Json::Value root = header;
  root["frames"] = Json::Value(numFrames);
  std::string jsonMessage = writer.write(root);
  PP_Var msgVar = moduleInterfaces.var->VarFromUtf8(jsonMessage.c_str(), 
    jsonMessage.length());
  NaClAMSendMessage(msgVar, frames, numFrames);
  moduleInterfaces.var->Release(msgVar);
}

static void messagePrint(const char* str) {
  Json::StyledWriter writer;
  Json::Value root;
  root["frames"] = Json::Value(0);
  root["request"] = Json::Value(-1);
  root["cmd"] = Json::Value("NaClAMPrint");
  root["print"] = Json::Value(str);
  std::string jsonMessage = writer.write(root);
  PP_Var msgVar = moduleInterfaces.var->VarFromUtf8(jsonMessage.c_str(),
                                                    jsonMessage.length());
  NaClAMSendMessage(msgVar, NULL, 0);
  moduleInterfaces.var->Release(msgVar);
}

void NaClAMPrintf(const char* str, ...) {
  const int bufferSize = 1024;
  char buff[bufferSize];
  buff[0] = '\0';
  va_list vl;
  va_start(vl, str);
  vsnprintf(&buff[0], bufferSize, str, vl);
  va_end(vl);
  messagePrint(buff);
}



static void heartBeat(void* userdata, int32_t result) {
  NaClAMModuleHeartBeat(microseconds());
  PP_CompletionCallback ccb;
  ccb.func = heartBeat;
  ccb.user_data = NULL;
  ccb.flags = 0;
  moduleInterfaces.core->CallOnMainThread(16, ccb, 0);
}

/* Instance */
static PP_Bool Instance_DidCreate(PP_Instance instance,
                                  uint32_t argc,
                                  const char* argn[],
                                  const char* argv[]) {
  moduleInstance = instance;
  NaClAMModuleInit();
  messageCollector.Init();
  heartBeat(NULL, 0);
  return PP_TRUE;
}

static void Instance_DidDestroy(PP_Instance instance) {
}

static void Instance_DidChangeView(PP_Instance instance,
                                   PP_Resource view_resource) {
}

static void Instance_DidChangeFocus(PP_Instance instance,
                                    PP_Bool has_focus) {
}

static PP_Bool Instance_HandleDocumentLoad(PP_Instance instance,
                                           PP_Resource url_loader) {
  return PP_FALSE;
}

/* Module */
PP_EXPORT int32_t PPP_InitializeModule(PP_Module a_module_id,
                                       PPB_GetInterface get_browser) {
  moduleInterfaces.messaging = (PPB_Messaging*)get_browser(PPB_MESSAGING_INTERFACE);
  moduleInterfaces.var = (PPB_Var*)get_browser(PPB_VAR_INTERFACE);
  moduleInterfaces.instance = (PPB_Instance*)get_browser(PPB_INSTANCE_INTERFACE);

  moduleInterfaces.fileSystem = (PPB_FileSystem*)get_browser(PPB_FILESYSTEM_INTERFACE);
  moduleInterfaces.fileIO = (PPB_FileIO*)get_browser(PPB_FILEIO_INTERFACE);
  moduleInterfaces.fileRef = (PPB_FileRef*)get_browser(PPB_FILEREF_INTERFACE);
  moduleInterfaces.core = (PPB_Core*)get_browser(PPB_CORE_INTERFACE);
  moduleInterfaces.gfx3d = (PPB_Graphics3D*)get_browser(PPB_GRAPHICS_3D_INTERFACE);
  moduleInterfaces.varArrayBuffer = (PPB_VarArrayBuffer*)get_browser(PPB_VAR_ARRAY_BUFFER_INTERFACE);
  return PP_OK;
}

static void HandleMessage(PP_Instance, struct PP_Var message) {
  //NaClAMPrintf("Messaged.");
  messageCollector.Collect(message);
  if (messageCollector.IsMessageReady()) {
    //NaClAMPrintf("Message Ready.");
    NaClAMMessage amMessage = messageCollector.GrabMessage();
    NaClAMModuleHandleMessage(amMessage);
    messageCollector.ClearMessage();
  }
}

PP_EXPORT const void* PPP_GetInterface(const char* interface_name) {
  if (strcmp(interface_name, PPP_INSTANCE_INTERFACE) == 0) {
    static PPP_Instance instance_interface = {
      &Instance_DidCreate,
      &Instance_DidDestroy,
      &Instance_DidChangeView,
      &Instance_DidChangeFocus,
      &Instance_HandleDocumentLoad,
    };
    return &instance_interface;
  }
  if (strcmp(interface_name, PPP_MESSAGING_INTERFACE) == 0) {
    static PPP_Messaging messaging_interface = {
      &HandleMessage
    };
    return &messaging_interface;
  }
  return NULL;
}

PP_EXPORT void PPP_ShutdownModule() {
}