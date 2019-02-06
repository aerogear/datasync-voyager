import { auditLog } from '@aerogear/voyager-audit'
import { ObjectState } from '@aerogear/voyager-conflicts'
import { SecurityService } from '@aerogear/voyager-keycloak'

export interface VoyagerContextProviderConfig {
  userContext?: any,
  securityService: SecurityService,
  auditLogger: any,
}
