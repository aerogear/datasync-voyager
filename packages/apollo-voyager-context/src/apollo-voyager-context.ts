import { IncomingMessage } from 'http'

/**
 * The VoyagerContextProvider will be used to extend the GraphQL context
 * With info from the various Voyager framework components
 * e.g. Security, Audit Logging, client info.
 */
export default class VoyagerContextProvider {

  public userContext: any

  constructor(userContext: any) {
    this.userContext = userContext
  }

  /**
   * returns the context object or function that should be passed into new ApolloServer()
   */
  getContext(): any {
    let contextBuilder : Function

    if (this.userContext && typeof this.userContext === 'function') {
      return this.combineContexts(VoyagerContextProvider.defaultContextProvider, this.userContext)
    } else {
      return this.userContext
    }
  }

  /**
   * Combines the Voyager context provider function with the user context function (or object)
   *
   * @param defaultContextProvider the Voyager default context provider function
   * @param userContextProvider the user supplied context provider
   */
  combineContexts(defaultContextProvider: Function, userContextProvider: Function): Function {
    return async function combineContexts({ req }: { req: IncomingMessage }): Promise<Object> {
      const defaultContext = VoyagerContextProvider.defaultContextProvider({ req })
      let userContext = userContextProvider({ req })

      if (userContext instanceof Promise) {
        userContext = await userContext
      }

      return { ...defaultContext, ...userContext }
    }
  }

  /**
   * The Voyager default context provider function. Right now it simply adds the request
   * to the context (like old sync server).
   */
  static defaultContextProvider({ req }: { req: IncomingMessage }): Object {
    return {
      request: req
    }
  }
}
