cmake_minimum_required(VERSION 4.0)

find_package(cmake-bare REQUIRED PATHS node_modules/cmake-bare)
find_package(cmake-fetch REQUIRED PATHS node_modules/cmake-fetch)

project(bare_punycode C)

fetch_package("github:holepunchto/libutf#8783203")
fetch_package("github:holepunchto/libpunycode#e0706e8")

add_bare_module(bare_punycode)

target_sources(
  ${bare_punycode}
  PRIVATE
    binding.c
)

target_link_libraries(
  ${bare_punycode}
  PRIVATE
    $<TARGET_OBJECTS:utf>
    $<TARGET_OBJECTS:punycode>
  PUBLIC
    utf
    punycode
)
