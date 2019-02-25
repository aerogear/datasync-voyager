#!/bin/bash

set -e

echo "Preparing release"

rm -Rf node_modules
npm install
npm run bootstrap
npm run compile
npm run test
npm run lint

# don't run in CI
if [ ! "$CI" = true ]; then
  ./node_modules/.bin/lerna publish --skip-git --force-publish=* --skip-npm
fi

echo "Repository is ready for release."

