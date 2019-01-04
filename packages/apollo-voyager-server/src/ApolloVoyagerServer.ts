'use strict'
import { ResolverMappings } from '@aerogear/apollo-voyager-tools'
import { ApolloServer, Config } from 'apollo-server-express'
import { DefaultVoyagerConfig } from './config/DefaultVoyagerConfig'
import { VoyagerConfig } from './config/VoyagerConfig'
import { ApolloVoyagerContextProvider } from './context/ApolloVoyagerContextProvider'
import { voyagerResolvers } from './voyagerResolver'
import { buildSchemaDirectives } from './buildSchemaDirectives'

/**
 *
 * Initialises an Apollo server that has been extended with the voyager framework
 * @param baseApolloConfig
 */
export function ApolloVoyagerServer (baseApolloConfig: Config, clientVoyagerConfig: VoyagerConfig): ApolloServer {
  const { typeDefs, resolvers, context } = baseApolloConfig

  if (typeDefs && resolvers) {
    if (clientVoyagerConfig && (clientVoyagerConfig.auditLogger || clientVoyagerConfig.metrics)) {
      baseApolloConfig.resolvers = voyagerResolvers(resolvers as ResolverMappings, clientVoyagerConfig)
    }
  }

  const voyagerConfig = new DefaultVoyagerConfig().merge(clientVoyagerConfig)

  // Build the context provider using user supplied context
  const contextProviderConfig = { userContext: context, ...voyagerConfig }

  const contextProvider = new ApolloVoyagerContextProvider(contextProviderConfig)
  const schemaDirectives = buildSchemaDirectives(baseApolloConfig, voyagerConfig)

  const apolloConfig = { ...baseApolloConfig, context: contextProvider.getContext(), schemaDirectives }

  const server = new ApolloServer(apolloConfig)
  return server
}

