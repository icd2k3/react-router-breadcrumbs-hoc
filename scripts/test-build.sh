#! /bin/bash

# runs the tests in ./src/index.test.js, but
# replaces the import to target the compiled builds
# in ./dist/es/index.js, ./dist/umd/index.js, and ./dist/cjs/index.js
# this ensures that the act of compiling doesn't break the
# expected behavior somehow.

set -e

DIVIDER="\n================================\n"

function test {
  printf "\nTest CJS dist build (v$1)$DIVIDER" && \
  TEST_BUILD=cjs yarn test --coverage=0 --silent && \
  printf "\nTest UMD dist build (v$1)$DIVIDER" && \
  TEST_BUILD=umd yarn test --coverage=0 --silent && \
  printf "\nTest ES dist build (v$1)$DIVIDER" && \
  TEST_BUILD=es yarn test --coverage=0 --silent
}

# Uncomment this block below to test next (alpha) react-router

# printf "\nInstalling react-router@next\n============\n" && \
# yarn add react-router@next --dev && \
# test && \

printf "\nInstalling react-router@^4.0.0$DIVIDER" && \
yarn add react-router@^4.0.0 --dev && \
test "^4.0.0"

printf "\nInstalling react-router@5.0.0$DIVIDER" && \
yarn add react-router@^5.0.0 --dev && \
test "^5.0.0" && \

printf "\nInstalling react-router@current$DIVIDER" && \
yarn add react-router --dev && \
test "Current"
