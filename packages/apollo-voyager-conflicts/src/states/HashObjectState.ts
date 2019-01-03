import * as debug from 'debug'
import { ObjectState } from '../api/ObjectState'
import { ObjectStateData } from '../api/ObjectStateData'
import { CONFLICT_LOGGER } from '../constants'

/**
 * Object state manager using a hashing method provided by user
 */
export class HashObjectState implements ObjectState {
  private logger = debug.default(CONFLICT_LOGGER)
  private hash: (object: any) => string

  constructor(hashImpl: (object: any) => string) {
    this.hash = hashImpl
  }

  public hasConflict(serverData: ObjectStateData, clientData: ObjectStateData) {
    if (this.hash(serverData) !== this.hash(clientData)) {
      return true
    }
    return false
  }

  public nextState(currentObjectState: ObjectStateData) {
    // Hash can be calculated at any time and it is not added to object
    return currentObjectState
  }
}
