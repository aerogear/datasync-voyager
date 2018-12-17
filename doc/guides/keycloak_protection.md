## Prerequisites:

- You have provisioned Keycloak as described in [AeroGear Docs](https://docs.aerogear.org/aerogear/latest/identity-management.html).

## Setting up Keycloak protection in sync framework

Import Voyager Keycloak module
```javascript
const { KeycloakSecurityService } = require('../../packages/apollo-voyager-keycloak')
```

Define the `hasRole` directive and use it in your type definitions:

```javascript
const typeDefs = gql`
  directive @hasRole(role: [String]) on FIELD | FIELD_DEFINITION

  type Query {
    hello: String @hasRole(role: "admin")
  }
`
```
Implementation of the `hasRole` directive is provided by the Voyager Keycloak module, but the definition is necessary.
In the example above, `hello` query is protected and it will only be executed if there is an authenticated user with a role `admin`.

Define your resolvers as you normally would. However, you can now use the properties and methods in `context.auth` object which is of type `AuthContextProvider` defined in `apollo-voyager-server`.
```javascript
const resolvers = {
  Query: {
    hello: (obj, args, context, info) => {

      // log some of the auth related info added to the context
      console.log(context.auth.isAuthenticated())

      const name = context.auth.accessToken.content.name || 'world'
      return `Hello ${name} from ${context.serverName}`
    }
  }
}
```

Read the Keycloak config and pass it to `KeycloakSecurityService`.
```javascript
const keycloakConfig = JSON.parse(fs.readFileSync(path.resolve(__dirname, './path/to/keycloak.json')))
const keycloakService = new KeycloakSecurityService(keycloakConfig)
```

Create the schema using the directives provided by `KeycloakSecurityService`.
```javascript
const schemaDirectives = keycloakService.getSchemaDirectives()

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
  // add directives
  schemaDirectives
})
```

The last piece of work to do is telling Voyager server that the `KeycloakSecurityService` above will be used as the security service.
```javascript
const voyagerConfig = {
  securityService: keycloakService
}

const server = ApolloVoyagerServer(apolloConfig, voyagerConfig)
```

