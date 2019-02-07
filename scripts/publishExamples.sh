#!/bin/sh

#script takes as params the names of directories of examples that should be pushed
TAG="${TAG:-latest}"
NAMESPACE="aerogear"

if [ ! "$CI" = true ]; then
  echo "Warning: this script should not be run outside of the CI"
  echo "If you really need to run this script, you can use"
  echo "CI=true ./scripts/publishRelease.sh"
  exit 1
fi

[ -z "$DOCKERHUB_USERNAME" ] && echo "Undefined DOCKERHUB_USERNAME, skipping publish" && exit 1;
[ -z "$DOCKERHUB_PASSWORD" ] && echo "Undefined DOCKERHUB_PASSWORD, skipping publish" && exit 1;

docker login -u $DOCKERHUB_USERNAME -p $DOCKERHUB_PASSWORD

for dir in "$@"
do
      RELEASE_IMAGE="$NAMESPACE/voyager-server-example-$dir:$TAG"
      LATEST_IMAGE="$NAMESPACE/voyager-server-example-$dir:latest"
      
      echo "Building release image $RELEASE_IMAGE"
      docker build -f Dockerfile -t $RELEASE_IMAGE -t $LATEST_IMAGE --build-arg directory=$dir .

      echo "Pushing image $RELEASE_IMAGE"
      docker push $RELEASE_IMAGE

      echo "Pushing image $LATEST_IMAGE"
      docker push $LATEST_IMAGE
 done
