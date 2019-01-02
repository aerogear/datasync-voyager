import { SecurityService } from '../security/SecurityService'
import { Metrics } from '../metrics'
import { AuditLogger } from '../audit'

export interface VoyagerConfig {

  /**
   * Optional security service to be applied
   */
  securityService: SecurityService
  metrics?: Metrics
  auditLogger?: AuditLogger
}
