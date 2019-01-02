import * as debug from 'debug'
import { ObjectState } from '../api/ObjectState'
import { ObjectStateData } from '../api/ObjectStateData'
import { CONFLICT_LOGGER } from '../constants'

/**
 * Object state manager using a hash field on object
 * Detects conflicts and allows moving to next state using the hash field of the object
 *
 * HashObjectState requires GraphQL types to contain hash field.
 * For example:
 *
 * type User {
 *   id: ID!
 *   hash: String
 * }
 */
export class HashObjectState implements ObjectState {
  private logger = debug.default(CONFLICT_LOGGER)
  private hash: (object: any) => string

  constructor(hashImpl: (object: any) => string) {
    this.hash = hashImpl
  }

  public hasConflict(serverData: ObjectStateData, clientData: ObjectStateData) {

    if (serverData.hash && clientData.hash) {
      if (serverData.hash !== clientData.hash) {
        this.logger(`Conflict when saving data. current: ${serverData}, client: ${clientData}`)
        return true
      }
    }
    return false
  }

  public nextState(currentObjectState: ObjectStateData) {
    this.logger(`Moving object to next state, ${currentObjectState}`)
    currentObjectState.hash = this.hash(currentObjectState)
    return currentObjectState
  }
}
