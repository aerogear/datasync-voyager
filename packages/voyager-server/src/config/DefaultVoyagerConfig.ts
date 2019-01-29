import { AuditLogger } from '../audit'
import { DefaultAuditLogger } from '../audit/DefaultAuditLogger'
import { DefaultSecurityService } from '../security/DefaultSecurityService'
import { SecurityService } from '../security/SecurityService'
import { VoyagerConfig } from './VoyagerConfig'

interface UserVoyagerConfig {
  securityService?: SecurityService | null
  auditLogger?: AuditLogger | null
}

export class DefaultVoyagerConfig implements VoyagerConfig {
  /**
   * Optional security service to be applied
   */
  public securityService: SecurityService = new DefaultSecurityService()
  public auditLogger: AuditLogger = new DefaultAuditLogger()

  public merge (userConfig: UserVoyagerConfig) {
    if (userConfig) {
      this.securityService = (userConfig.securityService) ? userConfig.securityService : this.securityService
      this.auditLogger = (userConfig.auditLogger) ? userConfig.auditLogger : this.auditLogger
    }
    return this
  }
}
