import { ServerOptions, SubscriptionServer } from 'subscriptions-transport-ws'
import * as WebSocket from 'ws'
import { execute, subscribe } from 'graphql'

import { VoyagerSubscriptionServerOptions } from './api'
import { VoyagerSubscriptionContextProvider } from './VoyagerSubscriptionContextProvider'

/**
 * Helper function that builds a regular SubscriptionServer
 * with additional built in capabilities and integrations
 * 
 * @param options all of the regular options passed to SubscrptionServer + a SecurityService
 * @param socketOptionsOrServer options for creating a socket or an already initialized Websocket.Server
 */
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
