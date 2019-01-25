const express = require('express')
const { makeExecutableSchema } = require('graphql-tools')
const queries = require("./queries")
const { ApolloVoyagerServer, gql } = require('../../packages/apollo-voyager-server')

const { conflictHandler } = require('../../packages/apollo-voyager-conflicts')

conflictHandler.enableLogging(console)

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
    ## Server resolution policy
    changeGreeting(msg: String!, version: Int!): Greeting
    ## Client resolution policy
    changeGreetingClient(msg: String!, version: Int!): Greeting
  }
`
// In Memory Data Source
let greeting = {
  msg: 'greeting from Voyager Server',
  version: 1
}

// Custom conflict resolution strategy that concatenates the msg properties together
const customGreetingResolutionStrategy = function(serverData, clientData, baseData) {
  return {
    msg: serverData.msg + ' ' + clientData.msg
  }
}

// Resolver functions. This is our business logic
const resolvers = {
  Mutation: {
    changeGreeting: async (obj, args, context, info) => {
      if (conflictHandler.hasConflict(greeting, args)) {

        const serverState = greeting
        const clientState = args
        const strategy = customGreetingResolutionStrategy

        // resolvedState is the new record the user should persist
        // response is the specially built message that should be returned to the client
        const { resolvedState, response } = await conflictHandler.resolveOnServer(strategy, serverState, clientState)
        greeting = resolvedState
        return response
      }
      greeting = conflictHandler.nextState(args)
      return greeting
    },
    changeGreetingClient: async (obj, args, context, info) => {
      if (conflictHandler.hasConflict(greeting, args)) {
        const serverState = greeting
        const clientState = args
        return await conflictHandler.resolveOnClient(serverState, clientState).response;
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
