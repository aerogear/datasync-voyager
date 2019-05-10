import { ServerOptions, SubscriptionServer } from 'subscriptions-transport-ws'
import * as WebSocket from 'ws'
import { execute, subscribe } from 'graphql'

import { VoyagerSubscriptionServerOptions } from './api'
import { VoyagerSubscriptionContextProvider } from './VoyagerSubscriptionContextProvider'

// takes in security service + regular options
// if security service has an onSubscriptionConnect, it adds it there,
// sets up the subscription server

export function createSubscriptionServer(options: VoyagerSubscriptionServerOptions, socketOptionsOrServer: WebSocket.ServerOptions | WebSocket.Server): SubscriptionServer {

  const subscriptionContextProvider = new VoyagerSubscriptionContextProvider(options)

  const { securityService, ...userServerOptions } = options

  const defaultServerOptions: ServerOptions = {
    execute,
    subscribe
  }

  const serverOptions  = { ...userServerOptions, ...defaultServerOptions, onConnect: subscriptionContextProvider.getOnConnectFunction() }
  return new SubscriptionServer(serverOptions, socketOptionsOrServer)
}