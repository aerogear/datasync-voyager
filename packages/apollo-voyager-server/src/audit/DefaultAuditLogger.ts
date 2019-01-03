import { AuditLogger } from './AuditLogger'
import { GraphQLResolveInfo } from 'graphql'

export class DefaultAuditLogger implements AuditLogger {
  
  logResolverCompletion (msg: string, success: boolean, obj: any, args: any, context: any, info: GraphQLResolveInfo): void {
    // no op
  }

  auditLog(msg: string, obj: any, args: any, context: any, info: GraphQLResolveInfo): void {
    // no op
  }
}