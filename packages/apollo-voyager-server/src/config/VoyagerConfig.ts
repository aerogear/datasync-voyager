import { SecurityService } from '../security/SecurityService'

export default interface VoyagerConfig {
  
  /**
   * Optional security service to be applied
   */
  securityService: SecurityService
}