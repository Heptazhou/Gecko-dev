# Recursive wildcard function
# http://blog.jgc.org/2011/07/gnu-make-recursive-wildcard-function.html
rwildcard=$(foreach d,$(wildcard $1*),$(call rwildcard,$d/,$2) \
  $(filter $(subst *,%,$2),$d))

# Target-and-rule "utility variables"
ifdef VERBOSE
  Q :=
  E =
else
  Q := @
  E = echo $(1)
endif

S := $(CFG_SRC_DIR)
B := $(CFG_BUILD_DIR)

#VPATH := $(S)src

# Delete the built-in rules.
.SUFFIXES:
%:: %,v
%:: RCS/%,v
%:: RCS/%
%:: s.%
%:: SCCS/s.%

MKFILE_DEPS := $(CFG_BUILD_HOME)config.stamp $(call rwildcard,$(S)mk/,*)

CFG_GCCISH_CFLAGS += -DRUST_DEBUG
CFG_RUSTC_FLAGS += -D unused-imports -D unused-variable

ifdef CFG_DISABLE_OPTIMIZE
  $(info cfg: disabling rustc optimization (CFG_DISABLE_OPTIMIZE))
  CFG_RUSTC_FLAGS +=
else
  CFG_RUSTC_FLAGS += -O
endif

CFG_RUSTC_FLAGS += -g
ifdef CFG_ENABLE_DEBUG
  $(info cfg: enabling more debugging in RUSTC (CFG_ENABLE_DEBUG))
  CFG_RUSTC_SELF_FLAGS += -g
endif

# FIXME: Remove once we’re on a Rust version without the old url crate
# https://github.com/rust-lang/rust/issues/16140
CFG_RUSTC_FLAGS += --extern url=$(B)/src/support/url/rust-url/liburl.rlib

# Handle target
TARGET_FLAGS = --target $(CFG_TARGET)
ifeq ($(CFG_OSTYPE),linux-androideabi)
  TARGET_FLAGS += -C linker=$(CFG_ANDROID_CROSS_PATH)/bin/arm-linux-androideabi-g++ -C ar=$(CFG_ANDROID_CROSS_PATH)/bin/arm-linux-androideabi-ar
endif

export CFG_RUSTC
export CFG_RUSTC_FLAGS
export CFG_LOCAL_RUSTC
export CFG_ENABLE_DEBUG
export CFG_ENABLE_DEBUG_SKIA
export RUSTC=$(CFG_RUSTC)
export RUSTDOC=$(CFG_RUST_HOME)/bin/rustdoc
export RUSTFLAGS=$(CFG_RUSTC_FLAGS)
export RANLIB=$(CFG_RANLIB)
export PYTHON=$(CFG_PYTHON2)
export PATH=$(CFG_PATH)
export CFG_ANDROID_SDK_PATH
export CFG_ANDROID_NDK_PATH
export CFG_OSTYPE
export CFG_CPUTYPE
export CFG_BUILD_HOME

######################################################################
# Re-configuration
######################################################################

ifndef CFG_DISABLE_MANAGE_SUBMODULES
# This is a pretty expensive operation but I don't see any way to avoid it
NEED_GIT_RECONFIG=$(shell cd "$(S)" && "$(CFG_GIT)" submodule status | grep -c '^\(+\|-\)')
else
NEED_GIT_RECONFIG=0
endif

ifeq ($(NEED_GIT_RECONFIG),0)
else
# If the submodules have changed then always execute config.mk
.PHONY: $(CFG_BUILD_HOME)config.stamp
endif

$(CFG_BUILD_HOME)Makefile $(CFG_BUILD_HOME)config.mk: $(CFG_BUILD_HOME)config.stamp

$(CFG_BUILD_HOME)config.stamp : $(S)configure $(S)Makefile.in
	@$(call E, cfg: reconfiguring)
	$(Q)$(S)configure $(CFG_CONFIGURE_ARGS)


SNAPSHOT_HASH_FILE=$(S)/rust-snapshot-hash
SNAPSHOT_VERSION=$(shell cat $(SNAPSHOT_HASH_FILE) | rev | cut -d/ -f1 | rev)
SNAPSHOT_HASH=$(shell cat $(SNAPSHOT_HASH_FILE) | cut -d/ -f1)
SNAPSHOT_URL="https://servo-rust.s3.amazonaws.com/$(shell cat $(SNAPSHOT_HASH_FILE))-$(DEFAULT_TARGET).tar.gz"
SNAPSHOT_TARBALL=$(B)/rust_snapshot/snapshot-$(SNAPSHOT_HASH).tgz
SNAPSHOT_HASH_STAMP=$(B)/rust_snapshot/hash-stamp

snapshot-url:
	@echo $(SNAPSHOT_URL)

$(SNAPSHOT_TARBALL):
	$(Q)curl -o $@.tmp $(SNAPSHOT_URL)
	$(Q)mv $@.tmp $@

clean-rust:
	$(Q)rm -rf $(B)/rust_snapshot/$(SNAPSHOT_VERSION)-$(DEFAULT_TARGET)


ifeq ($(CFG_SNAPSHOT_RUSTC),1)

ifeq (identical,$(and $(wildcard $(CFG_RUSTC)), $(wildcard $(SNAPSHOT_HASH_STAMP)), \
                      $(if $(shell diff $(SNAPSHOT_HASH_FILE) $(SNAPSHOT_HASH_STAMP)),,identical)))

$(CFG_RUSTC):
	@echo Rust snapshot $(SNAPSHOT_HASH) already up to date.

else

$(CFG_RUSTC): $(SNAPSHOT_TARBALL) clean-rust
	$(Q)tar -zxf $< -C $(B)/rust_snapshot/
	$(Q)cp -f $(SNAPSHOT_HASH_FILE) $(SNAPSHOT_HASH_STAMP)

endif

else  # not a snapshot

$(CFG_RUSTC):

endif

rust: $(CFG_RUSTC)


# Set up LD_LIBRARY_PATH os the compiler can find libraries
ifeq ($(CFG_OSTYPE),apple-darwin)
export DYLD_LIBRARY_PATH=$(CFG_RUST_HOME)/lib
else
export LD_LIBRARY_PATH=$(CFG_RUST_HOME)/lib
endif

# Strip off submodule paths to determine "raw" submodule names.
SUBMODULES=$(shell echo $(CFG_SUBMODULES) | perl -p -e 's![A-Za-z0-9_-]+/!!g')

# Define e.g. PATH_skia = support/skia/skia
$(foreach submodule,$(CFG_SUBMODULES),\
$(eval PATH_$(shell echo $(submodule) | perl -p -e 's![A-Za-z0-9_-]+/!!g') = $(submodule)))

define DEF_SUBMODULE_VARS

#defaults 
DEPS_$(1) =
CFLAGS_$(1) = -O2
CXXFLAGS_$(1) =

#if global cflags set, inherit that
ifdef CFLAGS
	CFLAGS_$(1) = $$(CFLAGS) 
endif

ifdef CXXFLAGS
	CXXFLAGS_$(1) = $$(CXXFLAGS)
endif

# any "done" dummy files must be named libSOMETHING.dummy. 
#
# We can't auto-compute this, because some modules have lib* prefix in
# their name already, while others don't.
DONE_$(1) = $$(B)src/$$(PATH_$(1))/lib*.dummy
DEPS_SUBMODULES += $$(PATH_$(1))
DEPS_SUBMODULES += $$(PATH_$(1))/.libs
DEPS_SUBMODULES += $$(PATH_$(1))/src/.libs
endef

# these will get populated.
DEPS_SUBMODULES =

$(foreach submodule,$(SUBMODULES),\
$(eval $(call DEF_SUBMODULE_VARS,$(submodule))))

# Handle rust submodule vars specially
DONE_rust = $(CFG_RUSTC)

# include submodule dependencies configuration
include $(S)mk/sub.mk

# Define how to compute approximate submodule dependencies.
# TODO: this may be a bit brutish, but is there a better way?
define DEF_SUBMODULE_DEPS
ROUGH_DEPS_$(1)=$$(call rwildcard,$$(S)src/$$(PATH_$(1)),*h *c *cpp *rs *rc)
DONE_DEPS_$(1)=$$(foreach dep,$$(DEPS_$(1)),$$(DONE_$$(dep)))
# the main target for a submodule
endef

# Define how to make submodule targets
define DEF_SUBMODULE_RULES

ENV_RLDFLAGS_$(1) += $$(foreach dep,$$(DEPS_$(1)),-L $$(B)src/$$(PATH_$$(dep)) -L $$(B)src/$$(PATH_$$(dep))/.libs -L $$(B)src/$$(PATH_$$(dep))/src/.libs)

# variables that depend on dependency definitions from sub.mk!
ENV_CFLAGS_$(1) = CFLAGS="$$(CFLAGS_$(1))"
ENV_CXXFLAGS_$(1) = CXXFLAGS="$$(CXXFLAGS_$(1))"
ENV_EXT_DEPS_$(1) = EXT_DEPS="$$(DONE_DEPS_$(1))"

# Some submodules should not be cross compiled
ifeq "$$(filter $(1),$$(NO_CROSS_BUILDS))" "$(1)"
ENV_RFLAGS_$(1) = RUSTFLAGS="$$(strip $$(CFG_RUSTC_FLAGS) $$(ENV_RLDFLAGS_$(1)))"
else
ENV_RFLAGS_$(1) = RUSTFLAGS="$$(strip $$(CFG_RUSTC_FLAGS) $$(ENV_RLDFLAGS_$(1)) $$(TARGET_FLAGS))"
endif

# Native builds do not depend on the rust compiler, so we can build them in parallel with rustc
RUSTC_DEP_$(1)=
ifneq "$$(filter $(1),$$(NATIVE_BUILDS))" "$(1)"
RUSTC_DEP_$(1)=$$(CFG_RUSTC)
endif

$(eval $(call DEF_SUBMODULE_DEPS,$(1)))

ifeq ($(CFG_CPUTYPE),i686)
CROSS_COMPILER_CC = CC='$(CFG_CC) -m32'
CROSS_COMPILER_CXX = CXX='$(CFG_CXX) -m32'
else
CROSS_COMPILER_CC = CC=$(CFG_CC)
CROSS_COMPILER_CXX = CXX=$(CFG_CXX)
endif
CROSS_COMPILER_LD = LD=$(CFG_LD)
CROSS_COMPILER_AR = AR=$(CFG_AR)

$$(DONE_$(1)) : $$(DONE_DEPS_$(1)) $$(ROUGH_DEPS_$(1)) $$(RUSTC_DEP_$(1))
#	@$$(call E, make: $(1))
#	@$$(call E, $(1) deps= $$(DEPS_$(1)))
#	@$$(call E, $(1) done_deps= $$(DONE_DEPS_$(1)))
#	@$$(call E, $(1) cflags= $$(ENV_CFLAGS_$(1)))
#	@$$(call E, $(1) cxxflags= $$(ENV_CXXFLAGS_$(1)))
#	@$$(call E, $(1) rflags= $$(ENV_RFLAGS_$(1)))
	$$(Q) \
	$$(ENV_CFLAGS_$(1)) \
	$$(ENV_CXXFLAGS_$(1)) \
	$$(ENV_RFLAGS_$(1)) \
	$$(ENV_EXT_DEPS_$(1)) \
	$$(CROSS_COMPILER_CC) \
	$$(CROSS_COMPILER_CXX) \
	$$(CROSS_COMPILER_LD) \
	$$(CROSS_COMPILER_AR) \
	$$(MAKE) -C $$(B)src/$$(PATH_$(1)) && touch $$(DONE_$(1))

# main submodule target
$(1) : $$(DONE_$(1))
.PHONY : $(1)
endef

$(foreach submodule,$(SUBMODULES),\
$(eval $(call DEF_SUBMODULE_RULES,$(submodule))))

DONE_SUBMODULES = $(foreach submodule,$(SUBMODULES),$(DONE_$(submodule)))

RFLAGS_macros = $(addprefix -L $(B)src/,$(DEPS_SUBMODULES))
SRC_macros = $(call rwildcard,$(S)src/components/macros/,*.rs)
CRATE_macros = $(S)src/components/macros/macros.rs
DONE_macros = $(B)src/components/macros/libmacros.dummy

DEPS_macros = $(CRATE_macros) $(SRC_macros) $(DONE_SUBMODULES)

RFLAGS_util = $(addprefix -L $(B)src/,$(DEPS_SUBMODULES))
SRC_util = $(call rwildcard,$(S)src/components/util/,*.rs)
CRATE_util = $(S)src/components/util/util.rs
DONE_util = $(B)src/components/util/libutil.dummy

DEPS_util = $(CRATE_util) $(SRC_util) $(DONE_SUBMODULES)

RFLAGS_net = $(addprefix -L $(B)src/,$(DEPS_SUBMODULES)) -L $(B)src/components/util
SRC_net = $(call rwildcard,$(S)src/components/net/,*.rs)
CRATE_net = $(S)src/components/net/net.rs
DONE_net = $(B)src/components/net/libnet.dummy

DEPS_net = $(CRATE_net) $(SRC_net) $(DONE_SUBMODULES) $(DONE_util)

RFLAGS_msg = $(addprefix -L $(B)src/,$(DEPS_SUBMODULES)) -L $(B)src/components/util
SRC_msg = $(call rwildcard,$(S)src/components/msg/,*.rs)
CRATE_msg = $(S)src/components/msg/msg.rs
DONE_msg = $(B)src/components/msg/libmsg.dummy

DEPS_msg = $(CRATE_msg) $(SRC_msg) $(DONE_SUBMODULES) $(DONE_util)

RFLAGS_gfx = $(addprefix -L $(B)src/,$(DEPS_SUBMODULES)) -L $(B)src/components/util -L $(B)src/components/style -L $(B)src/components/net -L $(B)src/components/msg -L$(B)src/components/macros
SRC_gfx = $(call rwildcard,$(S)src/components/gfx/,*.rs)
CRATE_gfx = $(S)src/components/gfx/gfx.rs
DONE_gfx = $(B)src/components/gfx/libgfx.dummy

DEPS_gfx = $(CRATE_gfx) $(SRC_gfx) $(DONE_SUBMODULES) $(DONE_util) $(DONE_style) $(DONE_net) $(DONE_msg) $(DONE_macros)

RFLAGS_script_traits = $(addprefix -L $(B)src/,$(DEPS_SUBMODULES)) -L $(B)src/components/msg -L $(B)src/components/net -L $(B)src/components/util

SRC_script_traits = $(call rwildcard,$(S)src/components/script_traits/,*.rs)
CRATE_script_traits = $(S)src/components/script_traits/script_traits.rs
DONE_script_traits = $(B)src/components/script_traits/libscript_traits.dummy

DEPS_script_traits = $(CRATE_script_traits) $(SRC_script_traits) $(DONE_msg) $(DONE_net)

RFLAGS_script = $(addprefix -L $(B)src/,$(DEPS_SUBMODULES)) -L $(B)src/components/util -L $(B)src/components/style -L $(B)src/components/net -L $(B)src/components/msg -L$(B)src/components/macros -L$(B)src/components/gfx -L$(B)src/components/script_traits

ifdef TRAVIS
# libscript has a habit of taking over 10 minutes while running on Travis,
# and Travis kills the build if we don't output anything for 10 minutes.
# Note: mk/doc.mk filters this out when calling rustdoc.
RFLAGS_script += -Z time-passes
endif

BINDINGS_SRC = $(S)src/components/script/dom/bindings/codegen
WEBIDLS_SRC = $(S)src/components/script/dom/webidls

WEBIDLS_script = $(call rwildcard, $(WEBIDLS_SRC), *.webidl)
BINDINGS_script = $(patsubst %.webidl, %Binding.rs, $(WEBIDLS_script))
AUTOGEN_SRC_script = $(foreach var, $(BINDINGS_script), $(subst $(WEBIDLS_SRC), $(BINDINGS_SRC)/Bindings, $(var)))

SRC_script = $(call rwildcard,$(S)src/components/script/,*.rs) $(AUTOGEN_SRC_script)
CRATE_script = $(S)src/components/script/script.rs
DONE_script = $(B)src/components/script/libscript.dummy

DEPS_script = $(CRATE_script) $(SRC_script) $(DONE_SUBMODULES) $(DONE_util) $(DONE_style) $(DONE_net) $(DONE_msg) $(DONE_macros) $(DONE_gfx) $(DONE_script_traits)

RFLAGS_style = $(addprefix -L $(B)src/,$(DEPS_SUBMODULES)) -L $(B)src/components/util -L$(B)src/components/macros
MAKO_ZIP = $(S)src/components/style/Mako-0.9.1.zip
MAKO_style = $(S)src/components/style/properties/mod.rs
MAKO_SRC_style = $(MAKO_style).mako
SRC_style = $(call rwildcard,$(S)src/components/style/,*.rs) $(call rwildcard,$(S)src/compontents/style/properties/*.rs) $(MAKO_style) $(S)src/components/style/user-agent.css
CRATE_style = $(S)src/components/style/style.rs
DONE_style = $(B)src/components/style/libstyle.dummy

DEPS_style = $(CRATE_style) $(SRC_style) $(DONE_SUBMODULES) $(DONE_util) $(DONE_macros)

RFLAGS_layout_traits = $(addprefix -L $(B)src/,$(DEPS_SUBMODULES)) -L $(B)src/components/gfx -L $(B)src/components/util -L $(B)src/components/net -L $(B)src/components/script_traits -L $(B)src/components/style -L $(B)src/components/msg

SRC_layout_traits = $(call rwildcard,$(S)src/components/layout_traits/,*.rs)
CRATE_layout_traits = $(S)src/components/layout_traits/layout_traits.rs
DONE_layout_traits = $(B)src/components/layout_traits/liblayout_traits.dummy

DEPS_layout_traits = $(CRATE_layout_traits) $(SRC_layout_traits) $(DONE_script_traits) $(DONE_msg) $(DONE_net) $(DONE_gfx) $(DONE_util)

RFLAGS_layout = $(addprefix -L $(B)src/,$(DEPS_SUBMODULES)) -L $(B)src/components/gfx -L $(B)src/components/util -L $(B)src/components/net -L $(B)src/components/script -L $(B)src/components/style -L $(B)src/components/msg -L$(B)src/components/macros -L$(B)src/components/layout_traits -L $(B)src/components/script_traits

SRC_layout = $(call rwildcard,$(S)src/components/layout/,*.rs)
CRATE_layout = $(S)src/components/layout/layout.rs
DONE_layout = $(B)src/components/layout/liblayout.dummy

DEPS_layout = $(CRATE_layout) $(SRC_layout) $(DONE_script) $(DONE_style) $(DONE_msg) $(DONE_macros) $(DONE_gfx) $(DONE_util) $(DONE_layout_traits)

RFLAGS_compositing = $(addprefix -L $(B)src/,$(DEPS_SUBMODULES)) -L $(B)src/components/gfx -L $(B)src/components/util -L $(B)src/components/net -L $(B)src/components/layout_traits -L $(B)src/components/script_traits -L $(B)src/components/style -L $(B)src/components/msg

SRC_compositing = $(call rwildcard,$(S)src/components/compositing/,*.rs)
CRATE_compositing = $(S)src/components/compositing/compositing.rs
DONE_compositing = $(B)src/components/compositing/libcompositing.dummy

DEPS_compositing = $(CRATE_compositing) $(SRC_compositing) $(DONE_util) $(DONE_msg) $(DONE_gfx) $(DONE_layout_traits) $(DONE_script_traits) $(DONE_style)

RFLAGS_servo = $(addprefix -L $(B)src/,$(DEPS_SUBMODULES)) -L $(B)src/components/gfx -L $(B)src/components/util -L $(B)src/components/net -L $(B)src/components/script -L $(B)src/components/layout_traits -L $(B)src/components/script_traits -L $(B)src/components/layout -L $(B)src/components/compositing -L $(B)src/components/style -L $(B)src/components/msg -L$(B)src/components/macros

SRC_servo = $(call rwildcard,$(S)src/components/main/,*.rs)
CRATE_servo = $(S)src/components/main/servo.rs

SERVO_LIB_CRATES = macros util net msg gfx script script_traits style layout layout_traits compositing

DEPS_servo = $(CRATE_servo) $(SRC_servo) $(DONE_SUBMODULES) $(foreach lib_crate,$(SERVO_LIB_CRATES),$(DONE_$(lib_crate)))

# rules that depend on having correct meta-target vars (DEPS_CLEAN, DEPS_servo, etc)
# and SERVO_LIB_CRATES
include $(S)mk/check.mk
include $(S)mk/clean.mk

.DEFAULT_GOAL := all
.PHONY:	all

# Servo helper libraries

define DEF_LIB_CRATE_RULES
$$(DONE_$(1)):	$$(DEPS_$(1))
	@$$(call E, compile: $$@)
	$$(Q)$$(RUSTC) $(strip $(TARGET_FLAGS) $(CFG_RUSTC_FLAGS)) $$(RFLAGS_$(1)) --out-dir $$(B)src/components/$(1) $$< && touch $$@
endef

$(foreach lib_crate,$(SERVO_LIB_CRATES),\
$(eval $(call DEF_LIB_CRATE_RULES,$(lib_crate))))

CACHE_DIR = $(BINDINGS_SRC)/_cache

bindinggen_dependencies := $(addprefix $(BINDINGS_SRC)/, BindingGen.py Bindings.conf Configuration.py CodegenRust.py parser/WebIDL.py ParserResults.pkl Bindings/.done)

$(AUTOGEN_SRC_script): $(BINDINGS_SRC)/Bindings/%Binding.rs: $(bindinggen_dependencies) \
                                                    $(addprefix $(WEBIDLS_SRC)/, %.webidl)
	@$(call E, "Maybe generating $(shell basename $@)...")
	$(Q) $(CFG_PYTHON2) $(BINDINGS_SRC)/pythonpath.py \
	  -I$(BINDINGS_SRC)/parser -I$(BINDINGS_SRC)/ply \
	  -D$(BINDINGS_SRC) \
	  $(BINDINGS_SRC)/BindingGen.py \
	  $(BINDINGS_SRC)/Bindings.conf Bindings/$*Binding $(addprefix $(WEBIDLS_SRC)/, $*.webidl)
	$(Q)touch $@

globalgen_dependencies := $(addprefix $(BINDINGS_SRC)/, GlobalGen.py Bindings.conf Configuration.py CodegenRust.py parser/WebIDL.py) $(CACHE_DIR)/.done $(BINDINGS_SRC)/Bindings/.done

$(MAKO_style): $(MAKO_SRC_style)
# Use a temporary file to avoid writing an empty (but more recent) file on failure.
	PYTHONPATH=$(MAKO_ZIP) $(CFG_PYTHON2) -c "from mako.template import Template; print(Template(filename='$<').render())" > $@.tmp
	mv $@.tmp $@

$(BINDINGS_SRC)/Bindings/.done:
	mkdir -p $(BINDINGS_SRC)/Bindings
	@touch $@

$(CACHE_DIR)/.done:
	mkdir -p $(CACHE_DIR)
	@touch $@

$(BINDINGS_SRC)/ParserResults.pkl: $(globalgen_dependencies) \
                                   $(WEBIDLS_script)
	$(Q) $(CFG_PYTHON2) $(BINDINGS_SRC)/pythonpath.py \
	  -I$(BINDINGS_SRC)/parser -I$(BINDINGS_SRC)/ply \
	  -D$(BINDINGS_SRC) \
	  $(BINDINGS_SRC)/GlobalGen.py $(BINDINGS_SRC)/Bindings.conf . \
	  --cachedir=$(CACHE_DIR) \
	  $(WEBIDLS_script)

# Servo binaries

ifneq ($(CFG_OSTYPE),linux-androideabi)
all: servo servo-embedding
servo:	$(DEPS_servo)
	@$(call E, compile: $@)
	$(Q)$(RUSTC) $(strip $(TARGET_FLAGS) $(CFG_RUSTC_FLAGS)) $(RFLAGS_servo) -C rpath $< --crate-type bin,dylib,rlib

RFLAGS_embedding = $(addprefix -L $(B)src/,$(DEPS_SUBMODULES)) -L $(B)src/components/gfx -L $(B)src/components/util -L $(B)src/components/net -L $(B)src/components/script -L $(B)src/components/layout -L $(B)src/components/layout_traits -L $(B)src/components/script_traits -L $(B)src/components/compositing -L $(B)src/components/style -L $(B)src/components/msg -L $(B).. -L $(B)src/components/main -L $(B)src/components/macros -A non_camel_case_types -A unused_variable

ifeq ($(CFG_OSTYPE),apple-darwin)
RFLAGS_embedding += -C link-args="-Wl,-U,_tc_new -Wl,-U,_tc_newarray -Wl,-U,_tc_delete -Wl,-U,_tc_deletearray"
endif
SRC_embedding = $(call rwildcard,$(S)src/components/embedding/,*.rs)
CRATE_embedding = $(S)src/components/embedding/embedding.rs

servo-embedding: servo $(SRC_embedding) $(CRATE_embedding)
	@$(call E, compile: $@)
	$(Q)$(RUSTC) $(strip $(TARGET_FLAGS) $(CFG_RUSTC_FLAGS)) $(RFLAGS_embedding) $(CRATE_embedding) -C rpath --crate-type dylib,rlib
	touch servo-embedding
else
all: servo
servo:  $(DEPS_servo)
	@$(call E, compile: $@)
	$(Q)$(RUSTC) $(strip $(TARGET_FLAGS) $(CFG_RUSTC_FLAGS)) $(RFLAGS_servo) $< -o libservo.so --crate-type dylib
	touch servo
endif

# Darwin app packaging

ifeq ($(CFG_OSTYPE),apple-darwin)

package: servo
	mkdir -p Servo.app/Contents/MacOS/src/platform/macos/rust-cocoa
	mkdir -p Servo.app/Contents/MacOS/src/platform/macos/rust-task_info
	mkdir -p Servo.app/Contents/MacOS/src/support/azure/rust-azure
	cp $(S)Info.plist Servo.app/Contents/
	cp servo Servo.app/Contents/MacOS/
	cp $(B)src/platform/macos/rust-cocoa/lib*.dylib Servo.app/Contents/MacOS/src/platform/macos/rust-cocoa/
	cp $(B)src/platform/macos/rust-task_info/lib*.dylib Servo.app/Contents/MacOS/src/platform/macos/rust-task_info/
	cp $(B)src/support/azure/rust-azure/lib*.dylib Servo.app/Contents/MacOS/src/support/azure/rust-azure/

else ifeq ($(CFG_OSTYPE),linux-androideabi)
package: servo
	mkdir -p sofile
	find . ! \( \( -type d -path './sofile' -o -path '*/host' \) -prune \) -name '*.so' -type f | xargs -I {} cp -f {} $(CFG_BUILD_HOME)sofile/
	find $(CFG_RUST_HOME)/lib/rustlib/$(CFG_TARGET)/lib/ -name '*.so' -type f -size +1c | xargs -I {} cp -f {} $(CFG_BUILD_HOME)sofile/
	cd $(S)src/platform/android/servo-android-glue && make with-libs
	cd $(CFG_BUILD_HOME)
	cp $(S)src/platform/android/servo-android-glue/bin/ServoAndroid-debug.apk $(CFG_BUILD_HOME)

else

.PHONY: package
package:

endif

bindings: $(AUTOGEN_SRC_script)

include $(S)mk/doc.mk
