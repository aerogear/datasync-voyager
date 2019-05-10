// import { AuditLogger } from '@aerogear/voyager-audit'
import { SecurityService } from '@aerogear/voyager-keycloak'

import { VoyagerSubscriptionServerOptions } from './api'

type OnConnectFunction = (connectionParams: any, webSocket: any, context: any) => any

/**
 * VoyagerSubscriptionContextProvider's purpose is to provide an
 * 'onConnect' function that allows developers to supply their own onConnect
 * the way they would with plain Apollo. However this onConnect will be combined
 * with our own onConnect which may do some things such as authentication/authorization
 * The results from our onConnect and the developer's onConnect functions are combined together
 * and are made available in the GraphQL context inside subscription resolvers
 * 
 */
export class VoyagerSubscriptionContextProvider {


  public userOnConnectFunction: any
  public userOnConnectObject: any
  public securityService: SecurityService

  private config: VoyagerSubscriptionServerOptions

  constructor(config: VoyagerSubscriptionServerOptions) {
    this.config = config

    if (typeof this.config.onConnect === 'function') {
      this.userOnConnectFunction = this.config.onConnect
    } else if (isObject(this.config.onConnect)) {
      this.userOnConnectObject = this.config.onConnect
    }

    this.securityService = this.config.securityService
  }

  /**
   * returns onConnect function that will be passed into new SubscriptionServer()
   * the returned onConnect function combines the contexts (results) of the
   * developer onConnect and a default onConnect provided here.
   * This allows us to inject additional integrations into subscriptions such as 
   * auth, metrics, auditLogging, etc
   */
  public getOnConnectFunction(): OnConnectFunction {
    const subscriptionContextProvider = this
    return async function onConnect(connectionParams: any, webSocket: any, context: any): Promise<object> {

      const defaultContext = await subscriptionContextProvider.getDefaultContext(connectionParams, webSocket, context)
      let userContext = subscriptionContextProvider.buildUserContext(connectionParams, webSocket, context)

      if (userContext instanceof Promise) {
        userContext = await userContext
      }

      return { ...userContext, ...defaultContext }
    }
  }

  /**
   * 
   * returns the onConnect value provided by the developer
   * if the user provided onConnect is a function
   * the result of that function is returned
   * 
   * @param connectionParams 
   * @param webSocket 
   * @param context 
   */
  private buildUserContext(connectionParams: any, webSocket: any, context: any): object {
    if (this.userOnConnectFunction) {
      return this.userOnConnectFunction(connectionParams, webSocket, context)
    }
    return this.userOnConnectObject
  }

  /**
   * 
   * returns any framework specific things we want to add
   * into the graphql context for subscriptions
   * right now it's just auth information provided by the given security service implementation
   * Could also be extended to include audit logging, metrics, etc.
   * 
   * @param connectionParams 
   * @param webSocket 
   * @param context 
   */
  private async getDefaultContext(connectionParams: any, webSocket: any, context: any): Promise<any> {
    if (this.securityService) {
      const auth = await this.securityService.onSubscriptionConnect(connectionParams, webSocket, context)
      const defaultContext = {
        auth
      }
      return defaultContext
    }
  }
}

function isObject(val: any) {
  if (val === null) { return false }
  return (typeof val === 'object' && !Array.isArray(val))
}
