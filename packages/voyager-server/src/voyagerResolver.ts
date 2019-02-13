'use strict'
import { FieldResolver, ResolverMappings, ResolverObject, ResolverWrapper, wrapResolvers } from '@aerogear/voyager-tools'
import { CompleteVoyagerConfig } from './config/VoyagerConfig'
import { ObjectConflictError } from '@aerogear/voyager-conflicts'

export function voyagerResolvers (resolverMappings: ResolverMappings, config: CompleteVoyagerConfig): ResolverMappings {
  return wrapResolvers(resolverMappings, voyagerResolverPartial(config))
}

export interface VoyagerResolversConfig {
  metrics: boolean,
  auditLogging: boolean
}

function voyagerResolverPartial (config: CompleteVoyagerConfig): ResolverWrapper {
  const { metrics, auditLogger } = config
  return (resolverFn: FieldResolver): FieldResolver => {
    return (obj: any, args: any, context: any, info: any) => {
      return new Promise(async (resolve, reject) => {
        const resolverStartTime = Date.now()
        try {
          const result = await resolverFn(obj, args, context, info)
          resolve(result)

          if (result instanceof ObjectConflictError) {
            const conflict = result as ObjectConflictError
            auditLogger.logConflict(conflict.message, conflict.conflictInfo.serverState, conflict.conflictInfo.clientState, obj, args, context, info)
            metrics.recordConflictMetrics(info)
          }

          const timeTook = Date.now() - resolverStartTime
          metrics.updateResolverMetrics(true, context, info, timeTook)
          auditLogger.logResolverCompletion('', true, obj, args, context, info)
        } catch (error) {
          const timeTook = Date.now() - resolverStartTime
          metrics.updateResolverMetrics(false, context, info, timeTook)
          if (auditLogger) {
            auditLogger.logResolverCompletion(error.message, false, obj, args, context, info)
          }
          reject(error)
        }
      })
    }
  }
}

export { FieldResolver, ResolverMappings, ResolverObject, ResolverWrapper, wrapResolvers }
