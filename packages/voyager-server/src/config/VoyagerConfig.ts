import { AuditLogger } from '../audit'
import { Metrics } from '../metrics'
import { SecurityService } from '../security/SecurityService'

export interface VoyagerConfig {

  /**
   * Optional security service to be applied
   */
  securityService: SecurityService
  metrics?: Metrics
  auditLogger?: AuditLogger
}
