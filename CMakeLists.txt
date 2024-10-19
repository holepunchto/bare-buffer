cmake_minimum_required(VERSION 3.25)

find_package(cmake-bare REQUIRED PATHS node_modules/cmake-bare)

project(bare_buffer C)

if(NOT TARGET utf)
  add_subdirectory(vendor/libutf EXCLUDE_FROM_ALL)
endif()

if(NOT TARGET base64)
  add_subdirectory(vendor/libbase64 EXCLUDE_FROM_ALL)
endif()

if(NOT TARGET hex)
  add_subdirectory(vendor/libhex EXCLUDE_FROM_ALL)
endif()

add_bare_module(bare_buffer)

target_sources(
  ${bare_buffer}
  PUBLIC
    $<TARGET_OBJECTS:base64>
    $<TARGET_OBJECTS:hex>
  PRIVATE
    binding.c
)

target_link_libraries(
  ${bare_buffer}
  PUBLIC
    base64
    hex
)
