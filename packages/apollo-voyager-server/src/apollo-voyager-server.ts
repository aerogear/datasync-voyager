'use strict'
import { ApolloServer, Config } from 'apollo-server-express'
import { VoyagerConfig } from './config/VoyagerConfig'
import { ApolloVoyagerContextProvider } from './context/ApolloVoyagerContextProvider'

/**
 *
 * Initialises an Apollo server that has been extended with the voyager framework
 * @param baseApolloConfig
 */
export function ApolloVoyagerServer (baseApolloConfig: Config, voyagerConfig: VoyagerConfig): ApolloServer {
  const { schema, context } = baseApolloConfig
  const { securityService } = voyagerConfig

  // Build the context provider using user supplied context
  // TODO: support context objects from users. Right now we support functions
  const contextProvider = new ApolloVoyagerContextProvider({ userContext: context, securityService })
  const apolloConfig = { ...baseApolloConfig, context: contextProvider.getContext() }

  const server = new ApolloServer(apolloConfig)
  return server
}

export { gql } from 'apollo-server-express'
export { SecurityService } from './security/SecurityService'
export * from './voyagerResolver'
