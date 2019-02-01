import { GraphQLResolveInfo } from 'graphql'

/**
 * Interface used to abstract conflict logging
 */
export interface ConflictListener {
  onConflict(message: string, serverData: any, clientData: any, obj: any, args: any, context: any, info: GraphQLResolveInfo): void
}
