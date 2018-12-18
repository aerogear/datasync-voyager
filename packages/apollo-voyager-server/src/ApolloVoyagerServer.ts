'use strict'
import { ApolloServer, Config } from 'apollo-server-express'
import { DefaultVoyagerConfig } from './config/DefaultVoyagerConfig'
import { VoyagerConfig } from './config/VoyagerConfig'
import { ApolloVoyagerContextProvider } from './context/ApolloVoyagerContextProvider'

/**
 *
 * Initialises an Apollo server that has been extended with the voyager framework
 * @param baseApolloConfig
 */
export function ApolloVoyagerServer (baseApolloConfig: Config, clientVoyagerConfig: VoyagerConfig): ApolloServer {
  const { schema, context } = baseApolloConfig

  // Build the context provider using user supplied context
  const voyagerConfig = new DefaultVoyagerConfig().merge(clientVoyagerConfig)
  const contextProviderConfig = { userContext: context, ...voyagerConfig }

  const contextProvider = new ApolloVoyagerContextProvider(contextProviderConfig)
  const apolloConfig = { ...baseApolloConfig, context: contextProvider.getContext() }

  const server = new ApolloServer(apolloConfig)
  return server
}
