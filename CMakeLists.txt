cmake_minimum_required(VERSION 3.25)

project(pear_buffer C)

include(pear)

if(NOT TARGET base64)
  add_subdirectory(vendor/libbase64 EXCLUDE_FROM_ALL)
endif()

add_pear_module(pear_buffer)

target_sources(
  pear_buffer
  PRIVATE
    binding.c
)

target_include_directories(
  pear_buffer
  PRIVATE
    $<TARGET_PROPERTY:base64,INTERFACE_INCLUDE_DIRECTORIES>
)

target_link_libraries(
  pear_buffer
  PUBLIC
    base64_static
)
