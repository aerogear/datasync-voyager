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
  type CharacterInfo {
    name: String
    homeworld: String
    gender: String
  }
  type Query {
    getCharacterInfo(id: ID!): CharacterInfo
  }
`;

// Resolver functions. This is our business logic
const resolvers = {
  Query: {
    getCharacterInfo: async (obj, args, context, info) => {
      //gets JSON response from the external API, parameter `id` is passed to the external API
      const response = await axios.get(
        `http://swapi.co/api/people/${args.id}`,
        {
          responseType: "json",
          headers: {
            "Content-Type": "application/json;charset=UTF-8"
          }
        }
      );
      const { data } = response;
      return data;
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
