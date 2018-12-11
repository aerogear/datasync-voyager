'use strict'
import { auditLog } from '@aerogear/apollo-voyager-audit'
import { ApolloVoyagerContextProvider } from '@aerogear/apollo-voyager-context'
import { updateResolverMetrics } from '@aerogear/apollo-voyager-metrics'
import { FieldResolver, ResolverMappings, ResolverObject, ResolverWrapper, wrapResolvers } from '@aerogear/apollo-voyager-tools'
import { ApolloServer, Config } from 'apollo-server-express'
import { VoyagerConfig } from './config/VoyagerConfig'
/**
 *
 * Initialises an Apollo server that has been extended with the voyager framework
 * @param baseApolloConfig
 */
export function ApolloVoyagerServer (baseApolloConfig: Config, voyagerConfig: VoyagerConfig): ApolloServer {
  const { schema } = baseApolloConfig

  // Build the context provider using user supplied context
  // TODO: support context objects from users. Right now we support functions
  const contextProvider = new ApolloVoyagerContextProvider(baseApolloConfig.context)
  const apolloConfig = { ...baseApolloConfig, context: contextProvider.getContext() }

  const server = new ApolloServer(apolloConfig)
  return server
}

export interface VoyagerResolversConfig {
  metrics: boolean,
  auditLogging: boolean
}

export function voyagerResolvers (resolverMappings: ResolverMappings, config: VoyagerResolversConfig): ResolverMappings {
  return wrapResolvers(resolverMappings, voyagerResolverPartial(config))
}

function voyagerResolverPartial (config: VoyagerResolversConfig): ResolverWrapper {
  return (resolverFn: FieldResolver): FieldResolver => {
    return (obj, args, context, info) => {
      return new Promise(async (resolve, reject) => {
        const resolverStartTime = Date.now()
        try {
          const result = await resolverFn(obj, args, context, info)
          if (config && config.auditLogging) {
            auditLog(true, context.request, info, obj, args, '')
          }
          resolve(result)

          if (config && config.metrics) {
            const timeTook = Date.now() - resolverStartTime
            updateResolverMetrics(info, timeTook)
          }
        } catch (error) {
          // we only publish time in success. const timeTook
          // NOPE: const timeTook = Date.now() - resolverStartTime
          // NOPE: updateResolverMetrics(info, timeTook)
          // but, we audit log in case of failure too
          if (config && config.auditLogging) {
            auditLog(false, context.request, info, obj, args, error.message)
          }
          reject(error)
        }
      })
    }
  }
}

export { gql } from 'apollo-server-express'
export { SecurityService } from './security/SecurityService'
export { FieldResolver, ResolverMappings, ResolverObject, ResolverWrapper, wrapResolvers }
