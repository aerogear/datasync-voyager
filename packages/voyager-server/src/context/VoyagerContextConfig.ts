import { AuditLogger } from '../audit'
import { SecurityService } from '../security/SecurityService'

export interface VoyagerContextProviderConfig {
  userContext?: any,
  securityService: SecurityService,
  auditLogger: AuditLogger
}
