const express = require('express')
const { newApolloServer, gql } = require('@aerogear/apollo-voyager-server')
const { makeExecutableSchema } = require('graphql-tools')

const PORT = 4000

const app = express()

const typeDefs = gql`
  type Query {
    hello: String
  }
`

const resolvers = {
  Query: {
    hello: (obj, args, context, info) => {
      
      // we can access the request object provided by the Voyager framework
      console.log(context.request.body)
      
      // we can access the context added below also
      console.log(context.serverName)
      return `Hello world from ${context.serverName}`
    }
  }
}

const schema = makeExecutableSchema({ typeDefs, resolvers })

const server = newApolloServer({ 
  schema,
  context: async ({ req }) => {
    // add some context to GraphQL requests
    console.log('my context provider')
    return { serverName: 'Voyager Server' }
  }
})
server.applyMiddleware({ app })

app.listen({ port: PORT }, () =>
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
)