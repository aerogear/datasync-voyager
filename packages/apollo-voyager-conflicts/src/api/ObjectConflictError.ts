import { GraphQLError } from 'graphql'
import { ObjectStateData } from './ObjectStateData'

/**
 * Data returned back to client wrapped in error objects.
 * Client side link highly depend on this data to notify client about conflict
 * and eventually perform client side conflict resolution
 */
export interface ConflictData {

  /**
   * Data that was modified on the server.
   * Source of the conflict with additional fields that changed over the time.
   */
  serverData: ObjectStateData

  /**
   * Original data that was sent from client and cannot be applied because of conflict
   */
  clientData?: ObjectStateData

  /**
   * Flag used to inform client that conflict was already resolved on the server
   * and no further processing is needed. When flag is true `serverData` field will contain
   * resolved information. If value is false client will need to resolve conflict on their side
   * and both `serverData` and `clientData` will be available
   */
  resolvedOnServer: boolean
}

/**
 * Conflict error that is being returned when server
 * Error specific to Voyager framework
 */
export class ObjectConflictError extends GraphQLError {
  public conflictInfo: any

  constructor(data: ConflictData) {
    super('VoyagerConflict')
    this.conflictInfo = data
  }
}
