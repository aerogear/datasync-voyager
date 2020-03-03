# AeroGear Data Sync

[![CircleCI](https://circleci.com/gh/aerogear/datasync.svg?style=svg)](https://circleci.com/gh/aerogear/datasync)
[![Coverage Status](https://coveralls.io/repos/github/aerogear/voyager-server/badge.svg)](https://coveralls.io/github/aerogear/voyager-server)

Home of the Aerogear Data Sync Framework. The goal of this project is to make it easier to build secure, production ready, realtime APIs and applications with GraphQL.

The project does this by taking the popular [Apollo Server](https://www.apollographql.com/docs/apollo-server/) framework and adding additional components to solve some common problems.

* Realtime Synchronisation
* Conflict Detection and Resolution
* Authentication and Authorization

The Voyager framework has a small ecosystem of components for building GraphQL based applications.

NOTE: For latest example of the datasync platform please go to:
https://github.com/aerogear/datasync-starter

### Client

* [voyager-client](https://www.npmjs.com/package/@aerogear/voyager-client) - JavaScript Client Library for building applications with Offline Capabilities

### Server

* [voyager-server](https://www.npmjs.com/package/@aerogear/voyager-server) - The core Voyager Server module.
* [voyager-keycloak](https://www.npmjs.com/package/@aerogear/voyager-keycloak) - Adds Authentication and Authorization to Voyager Server using [keycloak](https://www.keycloak.org/index.html).
* [voyager-conflicts](https://www.npmjs.com/package/@aerogear/voyager-conflicts) - Provides server side conflict detection mechanisms for building offline enabled applications.
* [voyager-subscriptions](https://www.npmjs.com/package/@aerogear/voyager-subscriptions) - Simplifies the set up of GraphQL Subscriptions, used for real time updates.
* [graphl-mqtt-subscriptions](https://www.npmjs.com/package/@aerogear/graphql-mqtt-subscriptions) - Enables the use of an MQTT Broker (Such as Mosquitto/RabbitMQ/Red Hat AMQ) as the Pub/Sub mechanism for GraphQL Subscriptions.

## Local Development Setup

The [Local Development Guide](./docs/guides/local-development.md) will help contributors to get started developing Voyager Server.

## Contributing

The [Contributing Guide](./CONTRIBUTING.md) will give you all of the information you need to ask for help, open Issues and open Pull Requests.

## Examples

The [Examples Guide](./examples/README.md) walks through some example applications which highlight some of Voyager Server's features.

## Docs


Documentation in ```docs/integreatly``` can be previewed using [Antora](https://docs.antora.org) using:

```antora local-antora-playbook.yml```
