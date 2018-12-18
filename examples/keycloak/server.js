const fs = require('fs')
const path = require('path')
const express = require('express')
const { makeExecutableSchema } = require('graphql-tools')

const { ApolloVoyagerServer, gql } = require('../../packages/apollo-voyager-server')
const { KeycloakSecurityService } = require('../../packages/apollo-voyager-keycloak')


const keycloakConfig = JSON.parse(fs.readFileSync(path.resolve(__dirname, './config/keycloak.json')))

// This is our Schema Definition Language (SDL)
const typeDefs = gql`

  # In the older version of graphql in the data sync server
  # We did not have to define the directive here.
  # For some reason we do now, otherwise makeExecutableSchema does not work.

  directive @hasRole(role: [String]) on FIELD | FIELD_DEFINITION

  type Query {
    hello: String @hasRole(role: "admin")
  }
`

// Resolver functions. This is our business logic
const resolvers = {
  Query: {
    hello: (obj, args, context, info) => {
      
      // log some of the auth related info added to the context
      console.log(context.auth.isAuthenticated())
      console.log(context.auth.accessToken.content.name)

      const name = context.auth.accessToken.content.name || 'world'
      return `Hello ${name} from ${context.serverName}`
    }
  }
}

// Initialize the keycloak service
const keycloakService = new KeycloakSecurityService(keycloakConfig)

// get the keycloak context provider and directives
const schemaDirectives = keycloakService.getSchemaDirectives()

const schema = makeExecutableSchema({ 
  typeDefs,
  resolvers,
  // add the keycloak directives
  schemaDirectives
})

// The context is a function or object that can add some extra data
// That will be available via the `context` argument the resolver functions
const context = ({ req }) => {
  return { 
    serverName: 'Voyager Server'
  }
}

// Initialize the apollo voyager server with our schema and context

const apolloConfig = { 
  schema,
  context
}

const voyagerConfig = {
  securityService: keycloakService
}

const server = ApolloVoyagerServer(apolloConfig, voyagerConfig)

const app = express()

// Apply the keycloak middleware to the express app.
// It's very important this is done before
// Applying the apollo middleware
// This function can also take an `options` argument
// To specify things like apiPath and other potential config
keycloakService.applyAuthMiddleware(app)
server.applyMiddleware({ app })

const port = 4000
app.listen({ port }, () =>
  console.log(`🚀 Server ready at http://localhost:${port}${server.graphqlPath}`)
)