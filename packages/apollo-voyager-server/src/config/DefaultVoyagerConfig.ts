import { SecurityService } from "../security/SecurityService"
import { VoyagerConfig } from "./VoyagerConfig";
import { DefaultSecurityService } from "../security/DefaultSecurityService";


export class DefaultVoyagerConfig implements VoyagerConfig {
  /**
   * Optional security service to be applied
   */
  public securityService: SecurityService = new DefaultSecurityService()

  public auditLog: any

  public merge(userConfig: VoyagerConfig) {
    return Object.assign(this, userConfig)
  }
}