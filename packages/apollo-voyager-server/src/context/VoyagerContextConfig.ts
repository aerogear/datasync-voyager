import { AuditLogger } from '@aerogear/apollo-voyager-audit'
import { ObjectState } from '@aerogear/apollo-voyager-conflicts'
import { SecurityService } from '@aerogear/apollo-voyager-keycloak'

export interface VoyagerContextProviderConfig {
  userContext?: any,
  securityService: SecurityService,
  auditLogger: AuditLogger,
  conflict: ObjectState
}
