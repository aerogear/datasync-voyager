import { GraphQLResolveInfo } from 'graphql'

export interface AuditLogger {
  auditLog (success: boolean, context: any, info: GraphQLResolveInfo, parent: any, args: any, msg: string): void
}