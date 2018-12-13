import { Config } from 'apollo-server-core'
import { SecurityService } from '../security/SecurityService'

export interface VoyagerConfig extends Config {

  /**
   * Optional security service to be applied
   */
  securityService: SecurityService

  auditLog: any
}
