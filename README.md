# Apollo Voyager Server

Home of the Aerogear Data Sync Framework. The goal of this project is to make it easier to build secure, production ready, realtime APIs and applications with GraphQL. 

The project does this by taking the popular [Apollo Server](https://www.apollographql.com/docs/apollo-server/) framework and adding additional components to solve some common problems.

* Realtime Synchronisation
* Conflict Resolution
* Authentication and Authorization

**Warning:** This project is under heavy development and is not recommended for production usage.

# Requirements

* Node.js `v8.12.0` or higher
* TypeScript `3.1.6`
* Lerna `3.4.3`

# Getting Started

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

# Examples

The `examples` directory has example scripts that show how the Voyager framework can be used.

If you have run the `npm run bootstrap` command, the dependencies should already be installed.

Try out `hello-server.js`.

```
$ node examples/hello-server.js
🚀 Server ready at http://localhost:4000/graphql
```