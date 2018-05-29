#! /bin/bash

set -e

yarn build && \
yarn run lint && \
yarn types && \
jest && \
yarn test-build && \
cat ./coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js
