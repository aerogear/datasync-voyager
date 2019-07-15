#!/bin/bash

NUM_COMMITS="$(git rev-list HEAD --count)"
LAST_COMMIT="$(git rev-parse --short HEAD)"
PRE_ID="dev.$NUM_COMMITS.$LAST_COMMIT"

npx lerna version prerelease --no-push --no-git-tag-version --yes --preid "$PRE_ID"
