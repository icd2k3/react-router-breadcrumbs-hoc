#! /bin/bash

# runs the tests in ./src/index.test.js, but
# replaces the import to target the compiled builds
# in ./dist/es/index.js and ./dist/umd/index.js

# NOTE: make sure to run `yarn build` prior to this script

set -e

TEST_BUILD=umd yarn test --coverage=0 && \
TEST_BUILD=es yarn test --coverage=0
