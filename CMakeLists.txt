cmake_minimum_required(VERSION 3.25)

find_package(cmake-bare REQUIRED PATHS node_modules/cmake-bare)
find_package(cmake-fetch REQUIRED PATHS node_modules/cmake-fetch)

project(bare_buffer C)

fetch_package("github:holepunchto/libutf#65b6ba0")
fetch_package("github:holepunchto/libbase64#4cd8d8b")
fetch_package("github:holepunchto/libhex#939999b")

add_bare_module(bare_buffer)

target_sources(
  ${bare_buffer}
  PRIVATE
    binding.c
)

target_link_libraries(
  ${bare_buffer}
  PRIVATE
    $<TARGET_OBJECTS:base64>
    $<TARGET_OBJECTS:hex>
  PUBLIC
    base64
    hex
)
