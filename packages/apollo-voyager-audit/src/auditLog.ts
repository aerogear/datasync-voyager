import { buildPath } from '@aerogear/voyager-tools'
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
      success?: boolean
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

export function auditLog (msg: string, obj: any, args: any, context: any, info: GraphQLResolveInfo) {
  auditLogger.info({
    audit: {
      msg: msg || '',
      requestId: context && context.request ? context.request.id : '',
      operationType: info.operation.operation,
      fieldName: info.fieldName,
      parentTypeName: info.parentType.name,
      path: buildPath(info.path),
      parent: obj,
      arguments: args,
      clientInfo: context && context.request && context.request.body && context.request.body.extensions && context.request.body.extensions.metrics || undefined,
      authenticated: !!(context && context.auth && context.auth.isAuthenticated()),
      userInfo: (context && context.auth && context.auth.accessToken) ? context.auth.accessToken.content : undefined
    }
  })
}

export function logResolverCompletion (msg: string, success: boolean, obj: any, args: any, context: any, info: GraphQLResolveInfo) {
  auditLogger.info({
    audit: {
      msg: msg || '',
      requestId: context && context.request ? context.request.id : '',
      operationType: info.operation.operation,
      fieldName: info.fieldName,
      parentTypeName: info.parentType.name,
      path: buildPath(info.path),
      success,
      parent: obj,
      arguments: args,
      clientInfo: context && context.request && context.request.body && context.request.body.extensions && context.request.body.extensions.metrics || undefined,
      authenticated: !!(context && context.auth && context.auth.isAuthenticated()),
      userInfo: (context && context.auth && context.auth.accessToken) ? context.auth.accessToken.content : undefined
    }
  })
}
