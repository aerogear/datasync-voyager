const express = require('express')
const { makeExecutableSchema } = require('graphql-tools')
const queries = require("./queries")
const { ApolloVoyagerServer, gql } = require('../../packages/apollo-voyager-server')

const { conflictHandler, handleConflictOnClient } = require('../../packages/apollo-voyager-conflicts')


// Types
const typeDefs = gql`
  type Hello {
    to: String
    ## Can be used to track conflicts
    version: Int
  }

  type Query {
    hello: String
  }

  type Mutation {
    changeHello(to: String!, version: Int!): Hello
  }
`
// In Memory Data Source
let hello = {
  to: 'Stewo Hapala',
  version: 1
}

// Resolver functions. This is our business logic
const resolvers = {
  Mutation: {
    changeHello: (obj, args, context, info) => {
      if (conflictHandler.hasConflict(hello, args)) {
        return handleConflictOnClient(hello, args)
      }
      hello = conflictHandler.nextState(args)
      return hello
    }
  },
  Query: {
    hello: (obj, args, context, info) => {
      return hello.to;
    }
  }
}

const schema = makeExecutableSchema({ typeDefs, resolvers })

// The context is a function or object that can add some extra data
// That will be available via the `context` argument the resolver functions
const context = ({ req }) => {
  return {
    serverName: 'Voyager Server'
  }
}

// Initialize the apollo voyager server with our schema and context
const server = ApolloVoyagerServer({
  playground: {
    tabs: [{
      endpoint: '/graphql',
      variables: {},
      query: queries
    }]
  },
  schema,
  context
})

const app = express()
server.applyMiddleware({ app })

const port = 4000
app.listen({ port }, () =>
  console.log(`🚀 Server ready at http://localhost:${port}${server.graphqlPath}`)
)
