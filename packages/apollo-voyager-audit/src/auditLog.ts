import { buildPath } from '@aerogear/apollo-voyager-tools'
import { GraphQLResolveInfo } from 'graphql'
import pino from 'pino'

interface AuditLogger {
  info (log: {
    audit: {
      msg: string
      requestId: string
      operationType: string
      fieldName: string
      parentTypeName: string
      path: string
      success: boolean
      parent: any
      arguments: any
      clientInfo: any
      authenticated: boolean
      userInfo: any
    }
  }): void
}

const log = pino()
const auditLogger: AuditLogger = log.child({tag: 'AUDIT'})

export function auditLog (success: boolean, context: any, info: GraphQLResolveInfo, parent: any, args: any, msg: string) {
  auditLogger.info({
    audit: {
      msg: msg || '',
      requestId: context && context.request ? context.request.id : '',
      operationType: info.operation.operation,
      fieldName: info.fieldName,
      parentTypeName: info.parentType.name,
      path: buildPath(info.path),
      success,
      parent,
      arguments: args,
      clientInfo: context && context.request && context.request.body && context.request.body.extensions && context.request.body.extensions.metrics || undefined,
      authenticated: !!(context && context.auth && context.auth.isAuthenticated()),
      userInfo: (context && context.auth && context.auth.accessToken) ? context.auth.accessToken.content : undefined
    }
  })
}
