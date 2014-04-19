VALID_TOOLCHAINS := newlib glibc pnacl

# force newlib for faster builds
TOOLCHAIN = newlib

include $(NACL_SDK_ROOT)/tools/common.mk


TARGET = testing
LIBS = $(DEPS) JSONRPC RPCTransport NaClRPCInstance ppapi_simple nacl_io ppapi_cpp ppapi gmock gtest pthread

CFLAGS = -I../../cpp -Wall -Wno-sign-compare
ifneq ($(TOOLCHAIN),pnacl)
CFLAGS += -Wno-unused-local-typedefs
endif
SOURCES = testing.cpp tester_test.cpp instance_test.cpp transport_test.cpp


# depend on the actual libraries

	
$(foreach src,$(SOURCES),$(eval $(call COMPILE_RULE,$(src),$(CFLAGS))))

ifeq ($(CONFIG),Release)
$(eval $(call LINK_RULE,$(TARGET)_unstripped,$(SOURCES),$(LIBS),$(DEPS)))
$(eval $(call STRIP_RULE,$(TARGET),$(TARGET)_unstripped))
else
$(eval $(call LINK_RULE,$(TARGET),$(SOURCES),$(LIBS),$(DEPS)))
endif

$(eval $(call NMF_RULE,$(TARGET),))
