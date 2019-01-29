import { AuditLogger, DefaultAuditLogger } from '@aerogear/apollo-voyager-audit'
import { ObjectState, VersionedObjectState } from '@aerogear/apollo-voyager-conflicts'
import { DefaultSecurityService, SecurityService } from '@aerogear/apollo-voyager-keycloak'
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
  public conflict: ObjectState = new VersionedObjectState()

  public merge(userConfig: UserVoyagerConfig) {
    if (userConfig) {
      this.securityService = (userConfig.securityService) ? userConfig.securityService : this.securityService
      this.auditLogger = (userConfig.auditLogger) ? userConfig.auditLogger : this.auditLogger
    }
    return this
  }
}
