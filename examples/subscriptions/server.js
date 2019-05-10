const express = require('express')
const { PubSub } = require('graphql-subscriptions')

const pubsub = new PubSub()

const { VoyagerServer, gql } = require('@aerogear/voyager-server')

const TOPIC = 'some_topic_name'

// This is our Schema Definition Language (SDL)
const typeDefs = gql`
  type Query {
    hello(name: String): String
  }

  type Subscription {
    hello: String
  }
`

// Resolver functions. This is our business logic
const resolvers = {
  Query: {
    hello: (obj, args, context, info) => {
      const message = args.name ? `Hello ${args.name}` : 'Hello world'
      pubsub.publish(TOPIC, { hello: message })
      return message
    }
  },
  Subscription: {
    hello: {
      subscribe: () => {
        return pubsub.asyncIterator(TOPIC)
      }
    }
  }
}

// Initialize the voyager server with our schema and context
const apolloServer = VoyagerServer({
  typeDefs,
  resolvers
})

const app = express()
apolloServer.applyMiddleware({ app })

module.exports = { 
  app,
  apolloServer,
  schema: apolloServer.schema
}
