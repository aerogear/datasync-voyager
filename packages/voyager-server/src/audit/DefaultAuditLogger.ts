import { GraphQLResolveInfo } from 'graphql'
import { AuditLogger } from './AuditLogger'

export class DefaultAuditLogger implements AuditLogger {

  public logResolverCompletion (msg: string, success: boolean, obj: any, args: any, context: any, info: GraphQLResolveInfo): void {
    // no op
  }

  public auditLog (msg: string, obj: any, args: any, context: any, info: GraphQLResolveInfo): void {
    // no op
  }

  public logConflict (msg: string, serverData: any, clientData: any, obj: any, args: any, context: any, info: GraphQLResolveInfo): void {
    // no op
  }
}
