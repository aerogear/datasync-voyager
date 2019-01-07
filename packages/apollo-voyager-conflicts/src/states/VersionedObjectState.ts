import * as debug from 'debug'
import { ObjectState } from '../api/ObjectState'
import { ObjectStateData } from '../api/ObjectStateData'
import { StatePersistence } from '../api/StatePersistence'
import { CONFLICT_LOGGER } from '../constants'

/**
 * Object state manager using a version field
 * Detects conflicts and allows moving to next state using the version field of the object
 *
 * VersionedObjectState requires GraphQL types to contain version field.
 * For example:
 *
 * type User {
 *   id: ID!
 *   version: String
 * }
 */
export class VersionedObjectState implements ObjectState {
  private logger = debug.default(CONFLICT_LOGGER)
  private statePersistence?: StatePersistence

  public hasConflict(serverData: ObjectStateData, clientData: ObjectStateData) {
    if (serverData.version && clientData.version) {
      if (serverData.version !== clientData.version) {
        this.logger(`Conflict when saving data. current: ${serverData}, client: ${clientData}`)
        return true
      }
    } else {
      this.logger(
        `Supplied object is missing version field required to determine conflict
         server: ${serverData}
         client: ${clientData}`)
    }
    return false
  }

  public async nextState(currentObjectState: ObjectStateData) {
    if (this.statePersistence) {
      await this.statePersistence.persist(currentObjectState)
    }
    this.logger(`Moving object to next state, ${currentObjectState}`)
    currentObjectState.version = currentObjectState.version + 1
    return currentObjectState
  }

  public async previousState(currentObjectState: ObjectStateData) {
    if (this.statePersistence) {
      return await this.statePersistence.fetch(currentObjectState)
    }
  }

  public enableStatePersistence(statePersistence: StatePersistence): void {
    this.statePersistence = statePersistence
  }
}

/**
 * Default instance of VersionedObjectState
 */
export const versionStateHandler = new VersionedObjectState()
