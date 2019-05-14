const { split } = require('apollo-link')
const { HttpLink } = require('apollo-link-http')
const { WebSocketLink } = require('apollo-link-ws')
const { getMainDefinition } = require('apollo-utilities')
const fetch = require('node-fetch')
const ws = require('ws')
const { ApolloClient } = require('apollo-client')
const { InMemoryCache } = require('apollo-cache-inmemory')

class TestApolloClient {
  constructor (host = 'localhost:4000', authHeaders) {
    this.client = createApolloClient(host, authHeaders)
  }

  subscribe (query, timeout = 3000) {
    return new Promise((resolve, reject) => {
      this.client.subscribe({
        query: query
      }).subscribe({
        next: resolve,
        error: reject
      })
      setTimeout(reject.bind(null, new Error('timed out while waiting for subscription result')), timeout)
    })
  }
}

module.exports = TestApolloClient

function createApolloClient (host, authHeaders) {
  // Create an http link:
  const httpLinkConfig = {
    uri: `http://${host}/graphql`,
    fetch: fetch,
    headers: authHeaders
  }

  const httpLink = new HttpLink(httpLinkConfig)

  // Create a WebSocket link:
  const wsLink = new WebSocketLink({
    uri: `ws://${host}/graphql`,
    options: {
      reconnect: true
    },
    webSocketImpl: ws
  })

  // using the ability to split links, you can send data to each link
  // depending on what kind of operation is being sent
  const link = split(
    // split based on operation type
    ({ query }) => {
      const { kind, operation } = getMainDefinition(query)
      return kind === 'OperationDefinition' && operation === 'subscription'
    },
    wsLink,
    httpLink
  )

  return new ApolloClient({
    link: link,
    cache: new InMemoryCache(),
    defaultOptions: {
      query: {
        fetchPolicy: 'no-cache'
      },
      watchQuery: {
        fetchPolicy: 'no-cache'
      }
    }
  })
}
