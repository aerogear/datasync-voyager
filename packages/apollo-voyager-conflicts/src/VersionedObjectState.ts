import * as debug from 'debug'
import { ConflictResolutionData } from './conflictHandlers'
import { CONFLICT_LOGGER } from './constants'
import { ObjectState } from './ObjectState'

/**
 * An out of the box object state manager using a version field
 * Detects conflicts and allows moving to next state using the version field of the object
 */
export class VersionedObjectState implements ObjectState {
  private logger = debug.default(CONFLICT_LOGGER)

  public hasConflict (serverData: any, clientData: any) {
    if (serverData.version && clientData.version) {
      if (serverData.version !== clientData.version) {
        this.logger(`Conflict when saving data. current: ${serverData}, client: ${clientData}`)
        return true
      }
    }
    return false
  }

  public next = (currentObjectState: ConflictResolutionData): ConflictResolutionData => {
    this.logger(`Moving object to next state, ${currentObjectState}`)
    currentObjectState.version = currentObjectState.version + 1
    return currentObjectState
  }
}
