import { AuditLogger, DefaultAuditLogger } from '@aerogear/voyager-audit'
import { Metrics, DefaultMetrics } from '@aerogear/voyager-metrics'
import { DefaultSecurityService, SecurityService } from '@aerogear/voyager-keycloak'
import { VoyagerConfig, CompleteVoyagerConfig } from './VoyagerConfig'

export class DefaultVoyagerConfig implements CompleteVoyagerConfig {
  /**
   * Optional security service to be applied
   */
  public securityService: SecurityService = new DefaultSecurityService()
  public auditLogger: AuditLogger = new DefaultAuditLogger()
  public metrics: Metrics = new DefaultMetrics()

  public merge(userConfig: VoyagerConfig) {
    if (userConfig) {
      this.securityService = (userConfig.securityService) ? userConfig.securityService : this.securityService
      this.auditLogger = (userConfig.auditLogger) ? userConfig.auditLogger : this.auditLogger
      this.metrics = (userConfig.metrics) ? userConfig.metrics : this.metrics
    }
    return this
  }
}
