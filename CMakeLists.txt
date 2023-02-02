cmake_minimum_required(VERSION 3.25)

project(pear_buffer C)

include(pear)

add_pear_module(pear_buffer)

target_sources(
  pear_buffer
  PRIVATE
    binding.c
)
