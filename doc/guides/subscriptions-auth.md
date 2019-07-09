# Authentication Over Websockets using Keycloak

Prerequisites:

* Follow the [Keycloak Protection Guide](./keycloak_protection.md) Guide first.

This section describes how to implement Authentication and Authorization over websockets with Keycloak. For more generic documentation on Authentication over Websockets, read Apollo's [Authentication Over Websocket](https://www.apollographql.com/docs/apollo-server/features/subscriptions/#authentication-over-websocket) document.

The Voyager Client supports adding token information to `connectionParams` that will be sent with the first WebSocket message. In the server, this token is used to authenticate the connection and to allow the subscription to proceeed. Read the section on [Keycloak Authentication in Voyager Client]() to ensure the Keycloak token is being sent to the server.

In the server, `createSubscriptionServer` accepts a `SecurityService` instance in addition to the regular options that can be passed to a standard `SubscriptionServer`. The `KeycloakSecurityService` from `@aerogear/voyager-keycloak` is used to validate the keycloak token passed by the client in the initial WebSocket message.

```js
const { createSubscriptionServer } = require('@aerogear/voyager-subscriptions')
const { KeycloakSecurityService } = require('@aerogear/voyager-keycloak')
const keycloakConfig = require('./keycloak.json') // typical Keycloak OIDC installation

const apolloServer = VoyagerServer({
  typeDefs,
  resolvers
})

securityService = new KeycloakSecurityService(keycloakConfig)

const app = express()

keycloakService.applyAuthMiddleware(app)
apolloServer.applyMiddleware({ app })

const server = app.listen({ port }, () =>
  console.log(`🚀 Server ready at http://localhost:${port}${apolloServer.graphqlPath}`)

  createSubscriptionServer({ schema: apolloServer.schema }, {
    securityService,
    server,
    path: '/graphql'
  })
)
```

The example shows how the keycloak `securityService` is created and how it is passed into `createSubscriptionServer`. This enables keycloak authentication on all subscriptions. Read the [Keycloak Protection Guide](./keycloak_protection.md) to learn more about creating a `KeycloakSecurityService`

## Keycloak Authorization in Subscriptions

The keycloak `securityService` will validate and parse the token sent by the client into a [Token Object](https://github.com/keycloak/keycloak-nodejs-connect/blob/master/middleware/auth-utils/token.js). This token is available in Subscription resolvers with `context.auth` and can be used to implement finer grained role based access control.

```js
const resolvers = {
  Subscription: {
    taskAdded: {
      subscribe: (obj, args, context, info) => {
        const role = 'admin'
        if (!context.auth.hasRole(role)) {
          return new Error(`Access Denied - missing role ${role}`)
        }
        return pubSub.asyncIterator(TASK_ADDED)
      }
    },
}
```

The above example shows role based access control inside a subscription resolver. `context.auth` is a full [Keycloak Token Object](https://github.com/keycloak/keycloak-nodejs-connect/blob/master/middleware/auth-utils/token.js) which means methods like `hasRealmRole` and `hasApplicationRole` are available.

The user details can be accessed through `context.auth.content`. Here is an example.

```
{
  "jti": "dc1d6286-c572-43c1-99c7-4f36982b0e56",
  "exp": 1561495720,
  "nbf": 0,
  "iat": 1561461830,
  "iss": "http://localhost:8080/auth/realms/voyager-testing",
  "aud": "voyager-testing-public",
  "sub": "57e1dcda-990f-4cc2-8542-0d1f9aae302b",
  "typ": "Bearer",
  "azp": "voyager-testing-public",
  "nonce": "552c3cba-a6c2-490a-9914-28784ba0e4bc",
  "auth_time": 1561459720,
  "session_state": "ed35e1b4-b43c-438f-b1a3-18b1be8c6307",
  "acr": "0",
  "allowed-origins": [
    "*"
  ],
  "realm_access": {
    "roles": [
      "developer",
      "uma_authorization"
    ]
  },
  "resource_access": {
    "voyager-testing-public": {
      "roles": [
        "developer"
      ]
    },
    "account": {
      "roles": [
        "manage-account",
        "manage-account-links",
        "view-profile"
      ]
    }
  },
  "preferred_username": "developer"
}
```

Having access to the user details (e.g. `context.auth.content.sub` is the authenticated user's ID) means it is possible to implement [Subscription Filters](https://www.apollographql.com/docs/apollo-server/features/subscriptions/#subscription-filters) and to subscribe to more fine grained pubsub topics based off the user details.