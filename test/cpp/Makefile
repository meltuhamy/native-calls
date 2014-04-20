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

SOURCE_NAMES = testing tester_test instance_test transport_test
SOURCES = $(addsuffix .cpp,$(SOURCE_NAMES))


# depend on the actual libraries

	
$(foreach src,$(SOURCES),$(eval $(call COMPILE_RULE,$(src),$(CFLAGS))))

ifeq ($(CONFIG),Release)
$(eval $(call LINK_RULE,$(TARGET)_unstripped,$(SOURCES),$(LIBS),$(DEPS)))
$(eval $(call STRIP_RULE,$(TARGET),$(TARGET)_unstripped))
else
$(eval $(call LINK_RULE,$(TARGET),$(SOURCES),$(LIBS),$(DEPS)))
endif

$(eval $(call NMF_RULE,$(TARGET),))

# if someone sets SHORTCUT, then use it to remove the others
#unstripped_x86_32 unstripped_x86_64

ALL_ARCHS = x86_32 x86_64 arm
SHORTCUT_ARCHS = $(filter-out $(ARCH),$(ALL_ARCHS))

#$(info INFORMATION CONFIG: $(CONFIG), TOOLCHAIN: $(TOOLCHAIN))

#1: the architecture e.g. x86_32
#2: target 
define TARGETS_SHORTCUT
$(TOOLCHAIN)/$(CONFIG)/$(2)_$(1).o:
	@echo "  SKIPPED $$@"
	@touch $$@

$(TOOLCHAIN)/$(CONFIG)/$(2)_unstripped_$(1).nexe:
	@echo "  SKIPPED $$@"
	@touch $$@

$(TOOLCHAIN)/$(CONFIG)/$(2)_$(1).nexe:
	@echo "  SKIPPED $$@"
	@touch $$@

#hardcode nmf
$(TOOLCHAIN)/$(CONFIG)/$(2).nmf:
	@echo "  SKIPPED $$@ [hardcoded nmf]"
	@echo "{\"files\":{},\"program\":{\"x86-64\":{\"url\":\"$$(TARGET)_x86_64.nexe\"},\"arm\":{\"url\":\"$$(TARGET)_arm.nexe\"},\"x86-32\":{\"url\":\"$$(TARGET)_x86_32.nexe\"}}}" > $$@

endef

# foreach source
# warning: setting ARCH will speed things up but it'll spew a tonne of Makefile Warnings
ifdef ARCH
$(foreach arch,$(SHORTCUT_ARCHS),$(foreach sname,$(SOURCE_NAMES) $(TARGET),$(eval $(call TARGETS_SHORTCUT,$(arch),$(sname)))))
endif