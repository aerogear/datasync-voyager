# Local Development Guide

## Requirements

* Git
* Node.js `v8.12.0` or higher. We recommend you install and manage Node.js versions using [Node Version Manager (nvm)](https://github.com/creationix/nvm)
* Docker

### Setting up Your Local Environment

Install the top level dependencies.

```
npm install
```

Set up the project. This installs the dependencies in all of the sub packages and ensures packages are linked together for local development.

```
npm run bootstrap
```

Compile the project.

```
npm run compile
```

Run the tests.

```
npm test
```

Run the linter.

```
npm run lint
```

Run the tests of example apps

``` bash
docker-compose -f examples/keycloak/config/docker-compose.yml up
# Wait for keycloak instance to spin up and in other terminal window run
cd examples && npm run test-examples
```

> **Note**
>
> If you comment out the `test.after.always` function call in [examples/test/keycloak.test.js](../../examples/test/keycloak.test.js) and run the tests, the configuration of Keycloak instance will remain, so you can use it for development. Look into the test and [examples/test/util/configureKeycloak.js](../../examples/test/util/configureKeycloak.js) file to get the list of users, roles and login password.
