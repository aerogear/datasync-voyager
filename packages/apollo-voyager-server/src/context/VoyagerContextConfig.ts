import { SecurityService } from '../security/SecurityService'
import { AuditLogger } from '../audit';

export interface VoyagerContextProviderConfig {
  userContext?: any,
  securityService: SecurityService,
  auditLogger: AuditLogger
}
