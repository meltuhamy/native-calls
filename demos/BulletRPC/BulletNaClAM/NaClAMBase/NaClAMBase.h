#pragma once

#include "ppapi/c/ppb.h"
#include "ppapi/c/ppb_graphics_3d.h"
#include "ppapi/c/ppb_instance.h"
#include "ppapi/c/ppb_opengles2.h"
#include "ppapi/c/ppb_input_event.h"
#include "ppapi/c/ppb_var.h"
#include "ppapi/c/ppb_view.h"
#include "ppapi/c/ppb_instance.h"
#include "ppapi/c/ppb_messaging.h"
#include "ppapi/c/ppb_file_system.h"
#include "ppapi/c/ppb_file_ref.h"
#include "ppapi/c/ppb_file_io.h"
#include "ppapi/c/ppb_core.h"
#include "ppapi/c/ppb_var_array_buffer.h"
#include "ppapi/c/ppp_instance.h"
#include "json/json.h"
#include "NaClAMMessage.h"

/**
 * The following PPAPIs are available to your acceleration module.
 * Accessed through the moduleInterfaces and moduleInstance variables.
 */
struct ModuleInterfaces {
  PPB_Messaging* messaging;
  PPB_Var* var;
  PPB_Instance* instance;
  PPB_FileSystem* fileSystem;
  PPB_FileIO* fileIO;
  PPB_FileRef* fileRef;
  PPB_Core* core;
  PPB_Graphics3D* gfx3d;
  PPB_VarArrayBuffer* varArrayBuffer;
};
extern ModuleInterfaces moduleInterfaces;
extern PP_Instance moduleInstance;

/**
 *
 * printf a message which is sent to JS.
 */
void NaClAMPrintf(const char*, ...);

/**
 * Constructs a JSON object ready as a reply to requestId
 * @param cmd A string containing the command name.
 * @param requestId The request id.
 */
Json::Value NaClAMMakeReplyObject(std::string cmd, int requestId);

/**
 *
 * Send a message back to JavaScript. 
 * @param header A string containing a JSON NaCL AM message header.
 * @param frames An array of arbitrary Strings or ArrayBuffers
 * @param numFrames Length of frames array
 */
void NaClAMSendMessage(const PP_Var& header, const PP_Var* frames, uint32_t numFrames);


/**
 *
 * Send a message back to JavaScript. 
 * @param header A Json::Value representing the header JSON object.
 * @param frames An array of arbitrary Strings or ArrayBuffers
 * @param numFrames Length of frames array
 */
void NaClAMSendMessage(const Json::Value& header, const PP_Var* frames, uint32_t numFrames);

/* Acceleration Modules implement the following functions: */

/**
 * This function is called at module initialization time.
 * moduleInterfaces and moduleInstance are already initialized.
 */
extern void NaClAMModuleInit();

/**
 * This function is called at 60hz.
 * @param microseconds A monotonically increasing clock
 */
extern void NaClAMModuleHeartBeat(uint64_t microseconds);

/**
 * This function is called for each message received from JS
 * @param message A complete message sent from JS
 */
extern void NaClAMModuleHandleMessage(const NaClAMMessage& message);
