#!/bin/sh
#script takes first param as current Voyager release version and next params the names of directories of examples that should be pushed

TAG="${TAG:-latest}"

for dir in "$@"
do
      CONTAINER="aerogear/voyager-server-example-$dir:$TAG"
      echo "Building docker container $CONTAINER"
      docker build -f Dockerfile -t "$CONTAINER" --build-arg directory="$dir" . && docker push "$CONTAINER"
 done
