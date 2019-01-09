import * as debug from 'debug'
import { ObjectState } from '../api/ObjectState'
import { ObjectStateData } from '../api/ObjectStateData'
import { ConflictResolution } from '../api/ConflictResolution'
import { ConflictResolutionStrategy } from '../api/ConflictResolutionStrategy'
import { CONFLICT_LOGGER } from '../constants'

/**
 * Object state manager using a hashing method provided by user
 */
export class HashObjectState implements ObjectState {
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

  public resolveOnClient(serverState: ObjectStateData, clientState: ObjectStateData) {
    return new ConflictResolution(false, serverState, clientState)
  }

  public async resolveOnServer (strategy: ConflictResolutionStrategy, serverState: ObjectStateData, clientState: ObjectStateData, baseState?: ObjectStateData) {
     let resolvedState = strategy(serverState, clientState, baseState)

     if (resolvedState instanceof Promise) {
       resolvedState = await resolvedState
     }

     resolvedState = this.nextState(resolvedState)

     return new ConflictResolution(true, resolvedState, clientState, baseState)
  }
}
