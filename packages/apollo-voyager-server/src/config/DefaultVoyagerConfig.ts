import { AuditLogger } from '../audit'
import { DefaultAuditLogger } from '../audit/DefaultAuditLogger'
import { DefaultSecurityService } from '../security/DefaultSecurityService'
import { SecurityService } from '../security/SecurityService'
import { VoyagerConfig } from './VoyagerConfig'

export class DefaultVoyagerConfig implements VoyagerConfig {
  /**
   * Optional security service to be applied
   */
  public securityService: SecurityService = new DefaultSecurityService()
  public auditLogger: AuditLogger = new DefaultAuditLogger()

  public merge (userConfig: VoyagerConfig) {
    return Object.assign(this, userConfig)
  }
}
