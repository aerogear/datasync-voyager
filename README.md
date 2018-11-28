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

## Basic Example

`basic/server.js` is the simplest example of how to use the `apollo-voyager-server` framework.

```
$ node examples/server.js
🚀 Server ready at http://localhost:4000/graphql
```

Open [http://localhost:4000/graphql](http://localhost:4000/graphql) and you will see the GraphQL Playground. This is a space where you can try out queries and see the results.

Try the following query.

```
query hello {
  hello
}
```

## Keycloak Example

`keycloak/server.js` shows how we can use the `KeycloakSecurityService` from `apollo-voyager-keycloak` to protect our app with Keycloak.

This example shows 

* How to set up authentication on the `/graphql` endpoint
* How to add role based access control on a Schema level using the `@hasRole` directive.

### Keycloak Setup

This example requires some extra setup. A `docker-compose.yml` file has been included to simplify a local keycloak setup.

The following steps set up a local keycloak instance, configures the instance for an example application and sets up a user that we can log into the application.

```
cd examples/keycloak/config
docker-compose up
```

* Open [http://localhost:8080/auth/admin/](http://localhost:8080/auth/admin/) and login with the user `admin` and password `admin`.
* Click **Add Realm** and click **Select File** next to the **Import** label.
* Select the [examples/keycloak/config/realm-export.json](examples/keycloak/config/realm-export.json) file and click **Create**.
* Click **Users** and add a new user called `developer`. You can choose your own name if you wish.
* Under the **Credentials** tab add a new password of **developer** and make sure it is not temporary. You can choose your own password if you wish.
* Under the **Role Mappings** tab assign the **admin** realm role.
* Select the **voyager-testing** option from the **Client Roles** dropdown and assign the **admin** role.

### Start the Server

```
node examples/keycloak/server.js
Initializing Keycloak authentication
🚀 Server ready at http://localhost:4000/graphql
```

Open [http://localhost:4000/graphql](http://localhost:4000/graphql) and you will be redirected to a login page. Log in with the user that was created earlier you should now see the the GraphQL playground.

In the playground you will see an error.

```json
{
  "error": "Failed to fetch schema. Please check your connection"
}
```

Do not worry, this error is caused by the playground making unauthenticated requests. One more step is needed.

In a new tab, open [http://localhost:4000/token](http://localhost:4000/token). You should see a JSON result.

```json
{"Authorization":"Bearer <Long String of Characters>"}
```

Copy the entire JSON result to your clipboard and navigate back to the Playground at [http://localhost:4000/graphql](http://localhost:4000/graphql). 

In the Playground, click the **HTTP Headers** button and paste the JSON result into the input box. If successful, the error will disappear and it is now possible to make queries.

Try out the following query

```
query hello {
  hello
}
```

### Role Based Access Control

The query above will only work if the authenticated user has the `admin` role. You can see this rule being applied with the `@hasRole(role: "admin")` directive in [examples/keycloak/server.js](examples/keycloak/server.js#L22).

Try change the the role to a made up role and restart the server. Try the sample query again and verify that an error is displayed.
