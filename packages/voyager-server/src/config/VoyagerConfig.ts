import { AuditLogger } from '@aerogear/voyager-audit'
import { ObjectState } from '@aerogear/voyager-conflicts'
import { SecurityService } from '@aerogear/voyager-keycloak'
import { Metrics } from '@aerogear/voyager-metrics'

export interface VoyagerConfig {

  /**
   * Enables Authentication and Authorization support
   */
  securityService?: SecurityService | null

  /**
   * Enables metrics feature
   */
  metrics?: Metrics | null

  /**
   * Enables audit logging feature
   */
  auditLogger?: AuditLogger | null
}

export interface CompleteVoyagerConfig {
  securityService: SecurityService
  metrics: Metrics
  auditLogger: AuditLogger
}
