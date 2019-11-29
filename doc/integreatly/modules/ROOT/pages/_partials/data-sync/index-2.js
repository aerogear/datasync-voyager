const express = require('express')
//Include our server libraries
const { VoyagerServer, gql } = require('@aerogear/voyager-server')

//Provide your graphql schema
const typeDefs = gql`
type Query {
  info: String!
  addressBook: [Person!]!
}

type Mutation {
  post(name: String!, address: String!): Person!
}

type Person {
  id: ID!
  address: String!
  name: String!
}
`

let persons = [{
  id: 'person-0',
  name: 'Alice Roberts',
  address: '1 Red Square, Waterford'
}]

let idCount = persons.length
const resolvers = {
  Query: {
    info: () => `This is a simple example`,
    addressBook: () => persons,
  },
  Mutation: {
    
    post: (parent, args) => {
       const person = {
        id: `person-${idCount++}`,
        address: args.address,
        name: args.name,
      }
      persons.push(person)
      return person
    }
  },
}

//Initialize the library with your Graphql information
const apolloServer = VoyagerServer({
  typeDefs,
  resolvers
})

//Connect the server to express
const app = express()
apolloServer.applyMiddleware({ app })

app.listen(4000, () =>
  console.log(`🚀 Server ready at http://localhost:4000/graphql`)
)

