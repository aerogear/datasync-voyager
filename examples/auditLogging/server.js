const express = require('express')
const { makeExecutableSchema } = require('graphql-tools')

const { ApolloVoyagerServer, gql } = require('../../packages/apollo-voyager-server')
const { setAuditLogEnabled, wrapResolversForAuditLogging} = require('../../packages/apollo-voyager-audit')

// This is our Schema Definition Language (SDL)
const typeDefs = gql`
  type Query {
    hello: String
  }
`

// Resolver functions. This is our business logic
let resolvers = {
  Query: {
    hello: (obj, args, context, info) => {
      return `Hello world from ${context.serverName}`
    }
  }
}

setAuditLogEnabled(true)
resolvers = wrapResolversForAuditLogging(resolvers)

const schema = makeExecutableSchema({ typeDefs, resolvers })

// The context is a function or object that can add some extra data
// That will be available via the `context` argument the resolver functions
const context = async ({ req }) => {
  // add some context to GraphQL requests
  console.log('my context provider')
  return { serverName: 'Voyager Server' }
}

// Initialize the apollo voyager server with our schema and context
const server = ApolloVoyagerServer({
  schema,
  context
})

const app = express()
server.applyMiddleware({ app })

const port = 4000
app.listen({ port }, () =>
  console.log(`🚀 Server ready at http://localhost:${port}${server.graphqlPath}`)
)
