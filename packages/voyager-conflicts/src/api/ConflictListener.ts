
/**
 * Interface used to abstract conflict logging
 */
export interface ConflictListener {
  onConflict(message: string, serverData: any, clientData: any, resolverInfo: any): void
}
