const express = require("express");
const { makeExecutableSchema } = require("graphql-tools");
const queries = require("./queries");
const axios = require("axios");
const {
  ApolloVoyagerServer,
  gql
} = require("../../packages/apollo-voyager-server");
const { GraphQLScalarType } = require("graphql");
const { Kind } = require("graphql/language");

// Types
const typeDefs = gql`
  scalar IntOrUnknown

  type CharacterInfo {
    name: String
    surname: String
    version: Int
    height: IntOrUnknown
    mass: IntOrUnknown
    hair_color: String
    skin_color: String
    eye_color: String
    homeworld: String
    gender: String
    genderFromName: GenderInfo
  }

  type GenderInfo {
    firstName: String
    lastName: String
    scale: Float
    gender: String
  }

  type Query {
    getCharacterInfo(id: ID!): CharacterInfo
    getGenderFromName(name: String, surname: String): GenderInfo
  }
`;

const getGenderFromName = async (obj, args, context, info) => {
  try {
    const { name, surname } = args;
    const response = await axios.get(
      `http://api.namsor.com/onomastics/api/json/gender/${name}/${surname}`,
      {
        headers: {
          "Content-Type": "application/json;charset=UTF-8"
        }
      }
    );

    const { data } = response;
    return data;
  } catch (e) {
    console.error(e);
  }
};

const getCharacterInfo = async (obj, args, context, info) => {
  try {
    const response = await axios.get(`http://swapi.co/api/people/${args.id}`, {
      responseType: "json",
      headers: {
        "Content-Type": "application/json;charset=UTF-8"
      }
    });
    const { data } = response;
    const [name, surname] = data.name.split(" ");
    return { ...data, name, surname };
  } catch (e) {
    console.error(e);
  }
};

// Resolver functions. This is our business logic
const resolvers = {
  Query: {
    getGenderFromName,
    getCharacterInfo
  },
  CharacterInfo: {
    genderFromName: async (obj, args, context, info) =>
      await getGenderFromName(
        obj,
        { name: obj.name, surname: obj.surname },
        context,
        info
      )
  },
  IntOrUnknown: new GraphQLScalarType({
    name: "IntOrUnknown",
    description: "Int with occasssional 'unknown' passed, resloved as -1",
    serialize(value) {
      return value === "unknown" ? -1 : parseInt(value);
    },
    parseValue(value) {
      return value === -1 ? "unknown" : value;
    },
    parseLiteral(ast) {
      switch (ast.kind) {
        case Kind.Int:
          return parseInt(ast.value, 10);
        default:
          return null;
      }
    }
  })
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
