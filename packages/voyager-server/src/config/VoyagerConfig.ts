import { AuditLogger } from '@aerogear/apollo-voyager-audit'
import { ObjectState } from '@aerogear/apollo-voyager-conflicts'
import { SecurityService } from '@aerogear/apollo-voyager-keycloak'
import { Metrics } from '@aerogear/apollo-voyager-metrics'

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
