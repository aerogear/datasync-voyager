const express = require('express')
const { makeExecutableSchema } = require('graphql-tools')
const queries = require("./queries")
const { ApolloVoyagerServer, gql } = require('../../packages/apollo-voyager-server')

const { conflictHandler, handleConflictOnClient } = require('../../packages/apollo-voyager-conflicts')


// Types
const typeDefs = gql`
  type Greeting {
    msg: String
    ## Can be used to track conflicts
    version: Int
  }

  type Query {
    greeting: String
  }

  type Mutation {
    changeGreeting(msg: String!, version: Int!): Greeting
  }
`
// In Memory Data Source
let greeting = {
  msg: 'greeting from Voyager Server',
  version: 1
}

// Resolver functions. This is our business logic
const resolvers = {
  Mutation: {
    changeGreeting: (obj, args, context, info) => {
      if (conflictHandler.hasConflict(greeting, args)) {
        return handleConflictOnClient(greeting, args)
      }
      greeting = conflictHandler.nextState(args)
      return greeting
    }
  },
  Query: {
    greeting: (obj, args, context, info) => {
      return greeting.msg;
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

module.exports = { app, server }
