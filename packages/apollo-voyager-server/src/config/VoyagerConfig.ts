import { SecurityService } from '../security/SecurityService'

export interface VoyagerConfig {
  
  /**
   * Optional security service to be applied
   */
  securityService: SecurityService
}