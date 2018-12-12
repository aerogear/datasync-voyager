import test from 'ava'
import express from 'express'
import { Application} from 'express-serve-static-core'
import { makeExecutableSchema } from 'graphql-tools'

import { ApolloServer } from 'apollo-server-express'
import * as http from 'http'
import { ApolloVoyagerServer, gql } from '../apollo-voyager-server'
import { VoyagerConfig } from '../config/VoyagerConfig'
import { TestApolloClient } from './testApolloClient'

let server: ApolloServer
let app: Application
let httpServer: http.Server

const biscuit = {
  name: 'Biscuit',
  breed: 'Arabian'
}

const john = {
  id: 0,
  name: 'John Marston',
  favoriteHorse: null,
  friends: []
}

const arthur = {
  id: 1,
  name: 'Arthur Morgan',
  favoriteHorse: biscuit,
  friends: [john]
}

const users = [john, arthur]

test.before(async t => {
  const typeDefs = gql`
    type Query {
      hello: String
      fails: String
      getUser(id: Int): User
    }

    type Mutation {
      createUser(name:String): User
    }

    type User {
      id: Int!
      name: String!
      favoriteHorse: Horse
      friends: [User]!
    }

    type Horse {
      name: String!
      breed: HorseBreed!
    }

    enum HorseBreed {
      Arabian
      Mustang
    }
  `

  const resolvers = {
    Query: {
      hello: (obj: any, args: any, context: any, info: any) => {
        return `Hello world from ${context.serverName}`
      },
      fails: (obj: any, args: any, context: any, info: any) => {
        throw new Error('Fails on purpose')
      },
      getUser: (obj: any, args: any, context: any, info: any) => {
        const user = users[args.id]
        if (user) {
          return {
            id: user.id,
            name: user.name
          }
        } else {
          return null
        }
      }
    },
    Mutation: {
      createUser: (obj: any, args: any, context: any, info: any) => {
        const id = users.length
        const user = {
          id,
          name: args.name,
          favoriteHorse: null,
          friends: []
        }
        users.push(user)
        return {
          id: user.id,
          name: user.name
        }
      }
    },
    User: {
      favoriteHorse: (obj: any, args: any, context: any, info: any) => {
        if (!obj || !users[obj.id]) {
          return null
        }
        return users[obj.id].favoriteHorse
      },
      friends: (obj: any, args: any, context: any, info: any) => {
        if (!obj || !users[obj.id] || !users[obj.id].friends || !users[obj.id].friends.length) {
          return []
        }
        const friends = users[obj.id].friends
        const retVal = []
        for (const friend of friends) {
          retVal.push({
            id: friend.id,
            name: friend.name
          })
        }
        return retVal
      }
    }
  }

  const schema = makeExecutableSchema({typeDefs, resolvers})

  const context = async () => {
    return {serverName: 'Voyager Server'}
  }

  server = ApolloVoyagerServer({
    schema,
    context
  }, {} as VoyagerConfig)

  app = express()
  server.applyMiddleware({app})

  const port = 8000
  httpServer = app.listen({port})
})

test.after(async t => {
  await server.stop()
  await httpServer.close()
})

test('should hello', async t => {
  const apolloClient = new TestApolloClient()
  const res = await apolloClient.client.query({
    // language=GraphQL
    query: gql`{
      hello
    }`
  })

  t.falsy(res.errors)
  t.deepEqual(res.data, { hello: 'Hello world from Voyager Server' })
})

test('should handle failing resolver', async t => {
  const apolloClient = new TestApolloClient()
  try {
    await apolloClient.client.query({
      // language=GraphQL
      query: gql`{
        fails
      }`
    })
    t.fail('should have failed')
  } catch (e) {
    t.deepEqual(e.message, 'GraphQL error: Fails on purpose')
  }
})

test('should call nested resolvers', async t => {
  const apolloClient = new TestApolloClient()
  const res = await apolloClient.client.query({
    // language=GraphQL
    query: gql`{
      getUser(id:0){id,name,favoriteHorse{name,breed}}
    }`
  })

  t.falsy(res.errors)
  t.deepEqual(res.data, {
    getUser: {
      __typename: 'User',
      id: 0,
      name: 'John Marston',
      favoriteHorse: null
    }
  })
})

test('should call nested resolvers of array items', async t => {
  const apolloClient = new TestApolloClient()
  const res = await apolloClient.client.query({
    // language=GraphQL
    query: gql`{
      getUser(id:1){
        id,
        name,
        favoriteHorse{name,breed},
        friends{
          id,
          name,
          favoriteHorse{name,breed}
        }}
    }`
  })

  t.falsy(res.errors)
  t.deepEqual(res.data, {
    getUser: {
      __typename: 'User',
      id: 1,
      name: 'Arthur Morgan',
      favoriteHorse: {__typename: 'Horse', name: 'Biscuit', breed: 'Arabian'},
      friends: [
        {
          __typename: 'User',
          id: 0,
          name: 'John Marston',
          favoriteHorse: null
        }
      ]
    }
  })
})

test('should return proper error message when a non-existing operation is called', async t => {
  const apolloClient = new TestApolloClient()
  try {
    await apolloClient.client.query({
      // language=GraphQL
      query: gql`{
        doesNotExist
      }`
    })
    t.fail('should have failed')
  } catch (e) {
    t.deepEqual((e.networkError as any).statusCode, 400)
  }
})

test('should pass arguments properly to mutations', async t => {
  const apolloClient = new TestApolloClient()

  const res = await apolloClient.client.mutate({
    // language=GraphQL
    mutation: gql`
      mutation {
        createUser(name:"Uncle"){id,name,favoriteHorse{name,breed},friends{name}}
      }
    `
  })

  t.falsy(res.errors)
  t.deepEqual(res.data, {
    createUser: {
      __typename: 'User',
      id: 2,
      name: 'Uncle',
      favoriteHorse: null,
      friends: []
    }
  })

  t.deepEqual(users[2].name, 'Uncle')
})
