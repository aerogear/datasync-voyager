#!/bin/sh

[ -z "$CI" ] && echo "This script is meant to run only from CircleCI." && exit 1;
[ -z "$DOCKERHUB_USERNAME" ] && echo "Undefined DOCKERHUB_USERNAME, skipping publish" && exit 1;
[ -z "$DOCKERHUB_PASSWORD" ] && echo "Undefined DOCKERHUB_PASSWORD, skipping publish" && exit 1;

docker login -u $DOCKERHUB_USERNAME -p $DOCKERHUB_PASSWORD

#script takes as params the names of directories of examples that should be pushed
TAG="${TAG:-latest}"
NAMESPACE="aerogear"

for dir in "$@"
do
      CONTAINER="$NAMESPACE/voyager-server-example-$dir:$TAG"
      CONTAINER_LATEST="$NAMESPACE/voyager-server-example-$dir:latest"
      echo "Building docker container $CONTAINER"
      docker build -f Dockerfile -t "$CONTAINER" --build-arg directory="$dir" . && docker push "$CONTAINER" && \
      docker tag "$CONTAINER" "$CONTAINER_LATEST" && docker push "$CONTAINER_LATEST"
 done
