import { DefaultSecurityService, SecurityService } from '@aerogear/voyager-keycloak'
import { VoyagerConfig, CompleteVoyagerConfig } from './VoyagerConfig'

export class DefaultVoyagerConfig implements CompleteVoyagerConfig {
  /**
   * Optional security service to be applied
   */
  public securityService: SecurityService = new DefaultSecurityService()

  public merge(userConfig: VoyagerConfig) {
    if (userConfig) {
      this.securityService = (userConfig.securityService) ? userConfig.securityService : this.securityService
    }
    return this
  }
}
