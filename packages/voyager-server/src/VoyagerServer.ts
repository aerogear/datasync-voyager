'use strict'
import { ResolverMappings } from '@aerogear/voyager-tools'
import { ApolloServer, Config } from 'apollo-server-express'
import { buildSchemaDirectives } from './buildSchemaDirectives'
import { DefaultVoyagerConfig } from './config/DefaultVoyagerConfig'
import { VoyagerConfig } from './config/VoyagerConfig'
import { ApolloVoyagerContextProvider } from './context/ApolloVoyagerContextProvider'

/**
 *
 * Initialises an Apollo server that has been extended with the voyager framework
 * @param baseApolloConfig
 */
export function VoyagerServer (baseApolloConfig: Config, clientVoyagerConfig: VoyagerConfig): ApolloServer {
  const { context } = baseApolloConfig

  const voyagerConfig = new DefaultVoyagerConfig().merge(clientVoyagerConfig)

  // Build the context provider using user supplied context
  const contextProviderConfig = { userContext: context, ...voyagerConfig }

  const contextProvider = new ApolloVoyagerContextProvider(contextProviderConfig)
  const schemaDirectives = buildSchemaDirectives(baseApolloConfig, voyagerConfig)

  const apolloConfig = { ...baseApolloConfig, context: contextProvider.getContext(), schemaDirectives }

  const server = new ApolloServer(apolloConfig)
  return server
}
