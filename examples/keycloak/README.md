## Keycloak Example

`keycloak/index.js` shows how we can use the `KeycloakSecurityService` from `voyager-keycloak` to protect our app with Keycloak.

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
* Select the [examples/keycloak/config/realm-export.json](./config/realm-export.json) file and click **Create**.
* Click **Users** and add a new user called `developer`. You can choose your own name if you wish.
* Under the **Credentials** tab add a new password of **developer** and make sure it is not temporary. You can choose your own password if you wish.
* Under the **Role Mappings** tab assign the **admin** realm role.
* Select the **voyager-testing** option from the **Client Roles** dropdown and assign the **admin** role.

### Start the Server

```
node keycloak/index.js
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

The query above will only work if the authenticated user has the `admin` role. You can see this rule being applied with the `@hasRole(role: "admin")` directive in [keycloak/server.js](./server.js#L22).

Try change the the role to a made up role and restart the server. Try the sample query again and verify that an error is displayed.

## Conflict Example

This example demonstrates how to use the `@aerogear/vogayer-conflicts` package to detect and handle data conflicts within the resolver functions.

### Running Example

```
$ node examples/conflicts/index.js
🚀 Server ready at http://localhost:4000/graphql
```

### Testing Conflict Resolution

Open [http://localhost:4000/graphql](http://localhost:4000/graphql).
You will see the GraphQL Playground. This is a space where you can try out queries and see the results.

Example contains 2 resolvers:

- changeGreeting: Resolver configured to resolve conflict on server

- changeGreetingClient: Resolver configured to resolve conflict on client


Conflict will be triggered when version supplied as mutation parameter will be 
different than version that server expects. To mitigate that in GraphQL Playground please:

1) Execute `changeGreeting` mutation.
First execution of the `changeGreeting` is going to perform successful update.
2) Execute `changeGreeting` mutation again without changing version
Second execution is going to cause conflict because version that is supplied did not change.
3) Increment version and execute mutation again.
Incrementing version will sucesfully save data without conflict.

## External REST API integration example

Using GraphQL it's possible to write resolvers that call some other APIs.

```js
const resolvers = {
  Query: {
    queryREST: async (obj, args, context) => {
       const result = await axios.get(YOUR_ENDPOINT_HERE, params);
       return result.data;
    }
  }
}
```

[examples/restapi/server.js](../../examples/restapi/server.js#L26-L39) shows how easy it is to integrate the consumption of a REST API endpoint into your GraphQL resolver.

