import { buildPath, wrapResolvers, ResolverObject } from '@aerogear/apollo-voyager-tools'
import { GraphQLResolveInfo } from 'graphql'
import { IFieldResolver } from 'graphql-tools'
import pino from 'pino'

interface AuditLogger {
  info (log: {
    msg: string
    requestId: string
    operationType: string
    fieldName: string
    parentTypeName: string
    path: string
    success: boolean
    parent: any
    arguments: any
  }): void
}

const log = pino()
const auditLogger: AuditLogger = log.child({tag: 'AUDIT'})

let auditLogEnabled = false

export function isAuditLogEnabled (): boolean {
  return auditLogEnabled
}

export function setAuditLogEnabled (val: boolean): void {
  auditLogEnabled = val
}

export function wrapResolversForAuditLogging (resolverMappings: { [key: string]: ResolverObject }): { [key: string]: ResolverObject } {
  return wrapResolvers(resolverMappings, wrapSingleResolverForAuditLogging)
}

export function auditLog (success: boolean, request: any, info: GraphQLResolveInfo, parent: any, args: any, msg: string) {
  if (auditLogEnabled) {
    auditLogger.info({
      msg: msg || '',
      requestId: request ? request.id : '',
      operationType: info.operation.operation,
      fieldName: info.fieldName,
      parentTypeName: info.parentType.name,
      path: buildPath(info.path),
      success,
      parent,
      arguments: args
    })
  }
}

///////////////////////////

function wrapSingleResolverForAuditLogging (resolverFn: IFieldResolver<any, any>): IFieldResolver<any, any> {
  return (obj: any, args: any, context: any, info: any) => {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await resolverFn(obj, args, context, info)
        auditLog(true, context.request, info, obj, args, '')
        resolve(result)
      } catch (error) {
        // we only publish time in success. const timeTook
        // NOPE: const timeTook = Date.now() - resolverStartTime
        // NOPE: updateResolverMetrics(info, timeTook)
        auditLog(false, context.request, info, obj, args, error.message)
        reject(error)
      }
    })
  }
}
