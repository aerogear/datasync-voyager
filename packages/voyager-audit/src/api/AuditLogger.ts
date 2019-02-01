import { GraphQLResolveInfo } from 'graphql'

/**
 * Audit logging interface that can be used to modify how audit logger works
 */
export interface AuditLogger {
  logResolverCompletion(msg: string, success: boolean, obj: any, args: any, context: any, info: GraphQLResolveInfo): void
  logConflict (msg: string, serverData: any, clientData: any, obj: any, args: any, context: any, info: GraphQLResolveInfo): void
  auditLog(msg: string, obj: any, args: any, context: any, info: GraphQLResolveInfo): void
}

/**
 * Method exposed to user (available in context) used to log audit log messages
 */
export type AuditLogMethod = (msg: string, obj: any, args: any, context: any, info: GraphQLResolveInfo) => void
