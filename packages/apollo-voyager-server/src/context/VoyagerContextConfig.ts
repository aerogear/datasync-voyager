import { SecurityService } from '../security/SecurityService'

export interface VoyagerContextProviderConfig {
  userContext: any,
  securityService?: SecurityService
}
