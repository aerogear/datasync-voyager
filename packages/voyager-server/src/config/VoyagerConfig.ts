import { AuditLogger } from '@aerogear/voyager-audit'
import { ObjectState } from '@aerogear/voyager-conflicts'
import { SecurityService } from '@aerogear/voyager-keycloak'
import { Metrics } from '@aerogear/voyager-metrics'

export interface VoyagerConfig {

  /**
   * Enables Authentication and Authorization support
   */
  securityService: SecurityService
  /**
   * Enables metrics feature
   */
  metrics?: Metrics

  /**
   * Enables audit logging feature
   */
  auditLogger?: AuditLogger

  /**
   * Enables to customize default approach for conflict handling.
   * By default it will use VersionedObjectState
   */
  conflict?: ObjectState
}
