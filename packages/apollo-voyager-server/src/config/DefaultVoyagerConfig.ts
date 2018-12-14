import { DefaultSecurityService } from '../security/DefaultSecurityService'
import { SecurityService } from '../security/SecurityService'
import { VoyagerConfig } from './VoyagerConfig'

export class DefaultVoyagerConfig implements VoyagerConfig {
  /**
   * Optional security service to be applied
   */
  public securityService: SecurityService = new DefaultSecurityService()

  public merge (userConfig: VoyagerConfig) {
    return Object.assign(this, userConfig)
  }
}
