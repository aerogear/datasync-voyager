'use strict'
import { ApolloServer, Config } from 'apollo-server-express'
import ApolloVoyagerContextProvider from '@aerogear/apollo-voyager-context'

/**
 *
 * Initialises an Apollo server that has been extended with the voyager framework
 * @param baseApolloConfig
 */
export function newApolloServer(baseApolloConfig: Config): ApolloServer {
  const { schema } = baseApolloConfig

  // Build the context provider using user supplied context
  // TODO: support context objects from users. Right now we support functions
  const contextProvider = new ApolloVoyagerContextProvider(baseApolloConfig.context)
  const apolloConfig = { ...baseApolloConfig, context: contextProvider.getContext() }

  const server = new ApolloServer(apolloConfig)
  return server
}

export { gql } from 'apollo-server-express'
