import { AuditLogMethod } from '@aerogear/voyager-audit'
import { SecurityService } from '@aerogear/voyager-keycloak'
import { IncomingMessage } from 'http'

/**
 * Type definition for that are mounted into context in Voyager Server.
 * Users can benefit from this interface by using it in their resolvers:
 *
 * resolverFunction(obj:any, args: Type, context: VoyagerContext)
 */
export interface VoyagerContext {
  request: IncomingMessage,
  auth: SecurityService
  auditLog: AuditLogMethod
}
