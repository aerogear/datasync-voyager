const express = require("express");
const { makeExecutableSchema } = require("graphql-tools");
const queries = require("./queries");
const axios = require("axios");
const {
  ApolloVoyagerServer,
  gql
} = require("../../packages/apollo-voyager-server");

// Types
const typeDefs = gql`
  type ModelInfo {
    Model_ID: ID!
    Make_Name: String
    Model_Name : String
  }

  type Query {
    getCarModels(brand: String!): [ModelInfo]
  }
`;

// Resolver functions. This is our business logic
const resolvers = {
  Query: {
    getCarModels: async (obj, args, context, info) => {
      //gets JSON response from the external API, parameter `brand` is passed to the external API
      const response = await axios.get(
        `https://vpic.nhtsa.dot.gov/api/vehicles/getmodelsformake/${args.brand}`,
        {
          responseType: "json",
          params: { format: "json" }
        }
      );
      const { data } = response;
      return data.Results;
    }
  }
};

const schema = makeExecutableSchema({ typeDefs, resolvers });

// The context is a function or object that can add some extra data
// That will be available via the `context` argument the resolver functions
const context = ({ req }) => {
  return {
    serverName: "Voyager Server"
  };
};

// Initialize the apollo voyager server with our schema and context
const server = ApolloVoyagerServer({
  playground: {
    tabs: [
      {
        endpoint: "/graphql",
        variables: {},
        query: queries
      }
    ]
  },
  schema,
  context
});

const app = express();
server.applyMiddleware({ app });

module.exports = { app, server };
