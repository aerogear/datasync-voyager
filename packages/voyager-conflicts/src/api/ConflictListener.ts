import { GraphQLResolveInfo } from 'graphql'

/**
 * Context object passed to listener that contains all parameters
 * that graphql resolvers accept. Users can pass `arguments` variable to satisfy this interface
 * directly from resolver
 */
export interface ListenerContext {
  obj: any,
  args: any,
  context: any,
  info: GraphQLResolveInfo
}

/**
 * Interface used to abstract conflict logging
 */
export interface ConflictListener {

  /**
   * @param message message sent to listener
   * @param serverData - data from server
   * @param clientData - data from client
   * @param listenerContext - contains additional fields from resolver
   */
  onConflict(message: string, serverData: any, clientData: any, listenerContext?: ListenerContext): void
}
