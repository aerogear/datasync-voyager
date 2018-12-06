# Local Development Guide

## Requirements

* Git
* Node.js `v8.12.0` or higher. We recommend you install and manage Node.js versions using [Node Version Manager (nvm)](https://github.com/creationix/nvm)

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