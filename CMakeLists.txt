cmake_minimum_required(VERSION 3.22)

project(pearjs_buffer C CXX)

execute_process(COMMAND pearjs-dev --include OUTPUT_VARIABLE PEARJS_INCLUDE)

include_directories(
  pearjs_buffer
  PUBLIC
    "${PEARJS_INCLUDE}"
)

add_library(
  pearjs_buffer
  MODULE
    binding.c
)

if(APPLE)
  set_target_properties(
    pearjs_buffer
    PROPERTIES
      LINK_FLAGS "-undefined dynamic_lookup -Xlinker -no_fixup_chains"
  )
endif(APPLE)

set_target_properties(
  pearjs_buffer
  PROPERTIES
    PREFIX ""
    SUFFIX ".pear"
    C_STANDARD 99
    POSITION_INDEPENDENT_CODE 1
)
