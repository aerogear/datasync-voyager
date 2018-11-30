import { IncomingMessage } from 'http'

type ContextFunction = (object: any) => any

/**
 * The VoyagerContextProvider will be used to extend the GraphQL context
 * With info from the various Voyager framework components
 * e.g. Security, Audit Logging, client info.
 */
export class ApolloVoyagerContextProvider {

  /**
   * The Voyager default context provider function. Right now it simply adds the request
   * to the context (like old sync server).
   */
  public static defaultContextProvider ({ req }: { req: IncomingMessage }): object {
    return {
      request: req
    }
  }

  public userContext: any

  constructor (userContext: any) {
    this.userContext = userContext
  }

  /**
   * returns the context object or function that should be passed into new ApolloServer()
   */
  public getContext (): any {
    if (this.userContext && typeof this.userContext === 'function') {
      return this.combineContexts(ApolloVoyagerContextProvider.defaultContextProvider, this.userContext)
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
  public combineContexts (defaultContextProvider: ContextFunction, userContextProvider: ContextFunction): object {
    return async function combineContexts ({ req }: { req: IncomingMessage }): Promise<object> {
      const defaultContext = ApolloVoyagerContextProvider.defaultContextProvider({ req })
      let userContext = userContextProvider({ req })

      if (userContext instanceof Promise) {
        userContext = await userContext
      }

      return { ...defaultContext, ...userContext }
    }
  }
}
