cmake_minimum_required(VERSION 3.25)

project(bare_buffer C)

include(bare)

if(NOT TARGET base64)
  add_subdirectory(vendor/libbase64 EXCLUDE_FROM_ALL)
endif()

if(NOT TARGET hex)
  add_subdirectory(vendor/libhex EXCLUDE_FROM_ALL)
endif()

add_bare_module(bare_buffer)

target_sources(
  bare_buffer
  PRIVATE
    binding.c
)

target_include_directories(
  bare_buffer
  PRIVATE
    $<TARGET_PROPERTY:base64,INTERFACE_INCLUDE_DIRECTORIES>
    $<TARGET_PROPERTY:hex,INTERFACE_INCLUDE_DIRECTORIES>
)

target_link_libraries(
  bare_buffer
  PUBLIC
    base64_static
    hex_static
)
