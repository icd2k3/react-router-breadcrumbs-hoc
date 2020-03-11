#! /bin/bash

# runs the tests in ./src/index.test.js, but
# replaces the import to target the compiled builds
# in ./dist/es/index.js, ./dist/umd/index.js, and ./dist/cjs/index.js

set -e

printf "\n====\nTesting CJS dist build\n====\n" && \
TEST_BUILD=cjs yarn test --coverage=0 && \
printf "\n====\nTesting UMD dist build\n====\n" && \
TEST_BUILD=umd yarn test --coverage=0 && \
printf "\n====\nTesting ES dist build\n====\n" && \
TEST_BUILD=es yarn test --coverage=0
