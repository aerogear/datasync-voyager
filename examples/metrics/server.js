const express = require('express')

const { VoyagerServer, gql } = require('@aerogear/voyager-server')
const metrics = require('@aerogear/voyager-metrics')

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

// The context is a function or object that can add some extra data
// That will be available via the `context` argument the resolver functions
const context = async ({ req }) => {
  // add some context to GraphQL requests
  console.log('my context provider')
  return { serverName: 'Voyager Server' }
}

const apolloConfig = {
  typeDefs,
  resolvers,
  context
}

const voyagerConfig = {
  metrics
}

// Initialize the voyager server with our schema and context
const server = VoyagerServer(apolloConfig, voyagerConfig)

const app = express()

metrics.applyMetricsMiddlewares(app)

server.applyMiddleware({ app })

module.exports = { app, server }
