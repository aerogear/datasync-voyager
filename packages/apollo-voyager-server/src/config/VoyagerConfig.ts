import { SecurityService } from '../security/SecurityService'
import { Config } from 'apollo-server-core'

export interface VoyagerConfig extends Config {

  /**
   * Optional security service to be applied
   */
  securityService: SecurityService

  auditLog: any
}
