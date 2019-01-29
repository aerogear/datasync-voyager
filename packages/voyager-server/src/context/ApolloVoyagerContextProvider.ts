import { AuditLogger } from '@aerogear/voyager-audit'
import { IncomingMessage } from 'http'
import { VoyagerContext } from './VoyagerContext'
import { VoyagerContextProviderConfig } from './VoyagerContextConfig'

type ContextFunction = (object: any) => any

/**
 * The VoyagerContextProvider will be used to extend the GraphQL context
 * With info from the various Voyager framework components
 * e.g. Security, Audit Logging, client info.
 */
export class ApolloVoyagerContextProvider {

  public config: VoyagerContextProviderConfig
  public auditLogger: AuditLogger
  public authContextProvider: any
  public userContextFunction: any
  public userContextObject: any

  constructor(config: VoyagerContextProviderConfig) {
    this.config = config

    if (typeof this.config.userContext === 'function') {
      this.userContextFunction = this.config.userContext
    } else if (isObject(this.config.userContext)) {
      this.userContextObject = this.config.userContext
    }

    this.authContextProvider = this.config.securityService.getAuthContextProvider()
    this.auditLogger = this.config.auditLogger
  }

  /**
   * returns the context object or function that should be passed into new ApolloServer()
   */
  public getContext(): ContextFunction {
    const voyagerContextProvider = this
    return async function combineContexts({ req }: { req: IncomingMessage }): Promise<object> {

      const defaultContext = voyagerContextProvider.getDefaultContext({ req })
      let userContext = voyagerContextProvider.buildUserContext({ req })

      if (userContext instanceof Promise) {
        userContext = await userContext
      }

      return { ...userContext, ...defaultContext }
    }
  }

  private buildUserContext({ req }: { req: IncomingMessage }): object {
    let userContext: any

    if (this.userContextFunction) {
      userContext = this.userContextFunction({ req })
    } else if (this.userContextObject) {
      userContext = this.userContextObject
    }
    return userContext
  }

  private getDefaultContext({ req }: { req: IncomingMessage }): VoyagerContext {
    const defaultContext: VoyagerContext = {
      request: req,
      auth: new this.authContextProvider({ req }),
      auditLog: this.auditLogger.auditLog,
      conflict: this.config.conflict
    }
    return defaultContext
  }
}

function isObject(val: any) {
  if (val === null) { return false }
  return (typeof val === 'object' && !Array.isArray(val))
}

export { VoyagerContextProviderConfig } from './VoyagerContextConfig'
