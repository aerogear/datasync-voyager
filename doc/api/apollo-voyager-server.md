# apollo-voyager-server API

### ApolloVoyagerServer(apolloConfig, voyagerConfig): <ApolloServer>

Initializes a new Apollo Server with extension points for the Voyager Framework.

* `apolloConfig`: <`Object`> - The same options object that can be provided to the Apollo Server constructor. The options are well documented in the [Apollo API documentation].
* `voyagerConfig`: <[`VoyagerConfig`](#VoyagerConfig)>

```js
const express = require('express')
const { ApolloVoyagerServer, gql } = require('@aerogear/apollo-voyager-server')

const typeDefs = gql`
  type Query {
    hello: String
  }
`
const resolvers = {
  Query: {
    hello: (obj, args, context, info) => {
      return `Hello world`
    }
  }
}

const server = ApolloVoyagerServer({
  typeDefs,
  resolvers
})

const app = express()
server.applyMiddleware({ app })

app.listen(4000, () =>
  console.log(`🚀 Server ready at http://localhost:4000/graphql`)
)
```

### VoyagerConfig

The core idea behind the Voyager framework is that features can be enabled by passing their implementations in `VoyagerConfig` object. This keeps the core `apollo-voyager-server` library lightweight and decoupled from the other features such as metrics, security and audit logging. New features in the future will be enabled using this same concept.

This options object is used to enable the additional features provided by the Voyager framework. 

* `VoyagerConfig`: <`Object`>

  * `securityService`: <[`SecurityService`](#SecurityService)> - A security service module that can add authentication and authorization to a voyager application. See the [apollo-voyager-keycloak] module as an example.

  ```js
    const { KeycloakSecurityService } = require('@aerogear/apollo-voyager-keycloak')

    const keycloakConfig = JSON.parse(fs.readFileSync( './config/keycloak.json')))

    // initialize the security service
    const securityService = new KeycloakSecurityService(keycloakConfig)

    const apolloConfig = { typeDefs, resolvers }
    const voyagerConfig = { securityService }

    const server = ApolloVoyagerServer(apolloConfig, voyagerConfig)

    const app = express()

    // call the apply the security service middleware to your express app
    // optionally takes a second config argument like { apiPath: '/mygraphqlendpoint' }
    securityService.applyAuthMiddleware(app)
    server.applyMiddleware({ app })

    app.listen(4000, () =>
      console.log(`🚀 Server ready at http://localhost:4000/graphql`)
    )
  ```

  * `metrics`: <[`Metrics`](#Metrics)> - A metrics module that can add resolver level metrics and metrics middlewares to your application. See the [apollo-voyager-metrics] module.


  ```js
  const metrics = require('@aerogear/apollo-voyager-metrics')

  const apolloConfig = { typeDefs, resolvers }
  const voyagerConfig = { metrics }

  const server = ApolloVoyagerServer(apolloConfig, voyagerConfig)

  const app = express()

  // apply the metrics middlwares to the express app
  metrics.applyMetricsMiddlewares(app)

  server.applyMiddleware({ app })

  app.listen(4000, () =>
    console.log(`🚀 Server ready at http://localhost:4000/graphql`)
  )
  ```

  * `auditLogger`: <[`AuditLogger`](#AuditLogger)> - An Audit Logger module that can add Audit Logging to your application for GraphQL operations, authentication and authorization operations, conflicts, etc. See the [apollo-voyager-audit] module.

  ```js
  const auditLogger = require('@aerogear/apollo-voyager-audit')

  const apolloConfig = { typeDefs, resolvers }
  const voyagerConfig = { auditLogger }

  const server = ApolloVoyagerServer(apolloConfig, voyagerConfig)

  const app = express()

  server.applyMiddleware({ app })

  app.listen(4000, () =>
    console.log(`🚀 Server ready at http://localhost:4000/graphql`)
  )
  ```

### SecurityService

See the [SecurityService] interface.

### Metrics

See the [Metrics] interface.

### AuditLogger

See the [AuditLogger] interface.

<!-- End of Doc. Links below.--->

[apollo-voyager-keycloak]: https://github.com/aerogear/apollo-voyager-server/tree/master/packages/apollo-voyager-keycloak
[apollo-voyager-metrics]: https://github.com/aerogear/apollo-voyager-server/tree/master/packages/apollo-voyager-metrics
[apollo-voyager-audit]: https://github.com/aerogear/apollo-voyager-server/tree/master/packages/apollo-voyager-audit
[Apollo API documentation]:(https://www.apollographql.com/docs/apollo-server/api/apollo-server.html#ApolloServer-listen-options-Promise).
[SecurityService]: ../../packages/apollo-voyager-server/src/security/SecurityService.ts
[Metrics]: ../../packages/apollo-voyager-server/src/metrics/Metrics.ts
[AuditLogger]: ../../packages/apollo-voyager-server/src/audit/AuditLogger.ts


