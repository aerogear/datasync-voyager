import { SecurityService } from '@aerogear/voyager-keycloak'

export interface VoyagerConfig {

  /**
   * Enables Authentication and Authorization support
   */
  securityService?: SecurityService | null
}

export interface CompleteVoyagerConfig {
  securityService: SecurityService
}
