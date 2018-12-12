import { InMemoryCache, NormalizedCacheObject } from 'apollo-cache-inmemory'
import { ApolloClient } from 'apollo-client'
import { split } from 'apollo-link'
import { HttpLink } from 'apollo-link-http'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'
import { OperationDefinitionNode } from 'graphql'
import fetch from 'node-fetch'
import ws from 'ws'

export class TestApolloClient {
  // TODO: new TestApolloClient().client.query --> new TestApolloClient().query

  public client: ApolloClient<NormalizedCacheObject>

  constructor (host = 'localhost:8000', authHeaders?: { [key: string]: string }) {
    this.client = createApolloClient(host, authHeaders)
  }

  // public subscribe (query, timeout = 3000) {
  //   return new Promise((resolve, reject) => {
  //     this.client.subscribe({
  //       query: query
  //     }).subscribe({
  //       next: resolve,
  //       error: reject
  //     })
  //     setTimeout(reject.bind(null, new Error('timed out while waiting for subscription result')), timeout)
  //   })
  // }
}

function createApolloClient (host: string, authHeaders?: { [key: string]: string }) {
  // Create an http link:
  const httpLinkConfig = {
    uri: `http://${host}/graphql`,
    fetch,
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
      const mainDefinition = getMainDefinition(query) as OperationDefinitionNode
      const { kind, operation } = mainDefinition
      return kind === 'OperationDefinition' && operation === 'subscription'
    },
    wsLink,
    httpLink
  )

  return new ApolloClient({
    link,
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
