import { ServerOptions, SubscriptionServer } from 'subscriptions-transport-ws'
import { SecurityService } from '@aerogear/voyager-keycloak'

export interface VoyagerSubscriptionServerOptions extends ServerOptions {
  securityService: SecurityService
}