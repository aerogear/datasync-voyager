import { AuditLogger } from '@aerogear/voyager-audit'
import { SecurityService } from '@aerogear/voyager-keycloak'

export interface VoyagerContextProviderConfig {
  userContext?: any,
  securityService: SecurityService,
  auditLogger: AuditLogger,
}
