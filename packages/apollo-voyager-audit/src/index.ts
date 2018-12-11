import { buildPath } from '@aerogear/apollo-voyager-tools'
import { GraphQLResolveInfo } from 'graphql'
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

export function auditLog (success: boolean, request: any, info: GraphQLResolveInfo, parent: any, args: any, msg: string) {
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
