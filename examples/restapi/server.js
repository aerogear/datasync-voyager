const express = require('express')
const queries = require('./queries')
const axios = require('axios')
const { VoyagerServer, gql } = require('@aerogear/voyager-server')
const { GraphQLError } = require('graphql')

// Types
const typeDefs = gql`
  type ModelInfo {
    Model_ID: ID!
    Make_Name: String
    Model_Name: String
  }

  type Query {
    getCarModels(brand: String!): [ModelInfo]
  }
`

// Resolver functions. This is our business logic
const resolvers = {
  Query: {
    getCarModels: async (obj, args, context, info) => {
      // gets JSON response from the external API, parameter `brand` is passed to the external API
      try {
        const response = await axios.get(
          `https://vpic.nhtsa.dot.gov/api/vehicles/getmodelsformake/${
            args.brand
          }`,
          {
            responseType: 'json',
            params: { format: 'json' }
          }
        )
        const { data } = response
        return data.Results
      } catch (e) {
        // do some error handling if necessary here
        throw new GraphQLError('Some error occured while calling the external API.')
      }
    }
  }
}

// Initialize the voyager server with our schema and context
const server = VoyagerServer({
  typeDefs,
  resolvers,
  playground: {
    tabs: [
      {
        endpoint: '/graphql',
        variables: {},
        query: queries
      }
    ]
  }
})

const app = express()
server.applyMiddleware({ app })

module.exports = { app, server }
