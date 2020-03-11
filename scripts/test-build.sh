#! /bin/bash

# runs the tests in ./src/index.test.js, but
# replaces the import to target the compiled builds
# in ./dist/es/index.js, ./dist/umd/index.js, and ./dist/cjs/index.js

set -e

echo "Testing CJS dist build" && \
TEST_BUILD=cjs yarn test --coverage=0 && \
echo "Testing UMD dist build" && \
TEST_BUILD=umd yarn test --coverage=0 && \
echo "Testing ES dist build" && \
TEST_BUILD=es yarn test --coverage=0
