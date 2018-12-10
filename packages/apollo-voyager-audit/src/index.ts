import { buildPath } from '@aerogear/apollo-voyager-tools'
import { GraphQLResolveInfo } from 'graphql'
import { IFieldResolver } from 'graphql-tools'
import pino from 'pino'

const log = pino()
const auditLogger = log.child({tag: 'AUDIT'})

let auditLogEnabled = false

export function isAuditLogEnabled (): boolean {
  return auditLogEnabled
}

export function setAuditLogEnabled (val: boolean): void {
  auditLogEnabled = val
}

interface ResolverObject {
  [key: string]: IFieldResolver<any, any>
}

export function wrapResolversForAuditLogging (resolverMappings: { [key: string]: ResolverObject }): { [key: string]: ResolverObject } {
  const output: { [key: string]: ResolverObject } = {}

  const typeKeys = Object.keys(resolverMappings)
  for (const typeKey of typeKeys) {
    output[typeKey] = {}

    const fieldResolversForType = resolverMappings[typeKey]
    const fieldKeysForType = Object.keys(fieldResolversForType)
    for (const fieldKey of fieldKeysForType) {
      const resolverForField = fieldResolversForType[fieldKey]
      output[typeKey][fieldKey] = wrapSingleResolverForAuditLogging(resolverForField)
    }
  }

  return output
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
