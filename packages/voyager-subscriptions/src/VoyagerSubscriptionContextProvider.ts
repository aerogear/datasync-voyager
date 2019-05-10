// import { AuditLogger } from '@aerogear/voyager-audit'
import { SecurityService } from '@aerogear/voyager-keycloak'

import { VoyagerSubscriptionServerOptions } from './api'

type OnConnectFunction = (connectionParams: any, webSocket: any, context: any) => any

/**
 * The VoyagerContextProvider will be used to extend the GraphQL context
 * With info from the various Voyager framework components
 * e.g. Security, Audit Logging, client info.
 */
export class VoyagerSubscriptionContextProvider {

  // public config: VoyagerContextProviderConfig

  // public authContextProvider: any
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
   * returns the context object or function that should be passed into new ApolloServer()
   */
  public getOnConnectFunction(): OnConnectFunction {
    const subscriptionContextProvider = this
    return async function combineContexts(connectionParams: any, webSocket: any, context: any): Promise<object> {

      const defaultContext = await subscriptionContextProvider.getDefaultContext(connectionParams, webSocket, context)
      let userContext = subscriptionContextProvider.buildUserContext(connectionParams, webSocket, context)

      if (userContext instanceof Promise) {
        userContext = await userContext
      }

      return { ...userContext, ...defaultContext }
    }
  }

  private buildUserContext(connectionParams: any, webSocket: any, context: any): object {
    if (this.userOnConnectFunction) {
      return this.userOnConnectFunction(connectionParams, webSocket, context)
    }
    return this.userOnConnectObject
  }

  private async getDefaultContext(connectionParams: any, webSocket: any, context: any): Promise<any> {
    const auth = await this.securityService.onSubscriptionConnect(connectionParams, webSocket, context)
    const defaultContext = {
      auth
    }
    return defaultContext
  }
}

function isObject(val: any) {
  if (val === null) { return false }
  return (typeof val === 'object' && !Array.isArray(val))
}
