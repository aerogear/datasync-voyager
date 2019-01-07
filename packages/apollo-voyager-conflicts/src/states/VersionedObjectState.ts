import { ConflictLogger } from '../api/ConflictLogger'
import { ObjectState } from '../api/ObjectState'
import { ObjectStateData } from '../api/ObjectStateData'
import { StatePersistence } from '../api/StatePersistence'

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
  private statePersistence?: StatePersistence
  private logger: ConflictLogger | undefined

  public hasConflict(serverData: ObjectStateData, clientData: ObjectStateData) {
    if (serverData.version && clientData.version) {
      if (serverData.version !== clientData.version) {
        if (this.logger) {
          this.logger.info(`Conflict when saving data.
          current: ${serverData}, client: ${clientData}`)
        }
        return true
      }
    } else if (this.logger) {
      this.logger.info(
        `Supplied object is missing version field required to determine conflict
         server: ${ serverData}
         client: ${ clientData}`)
    }
    return false
  }

  public async nextState(currentObjectState: ObjectStateData) {
    if (this.statePersistence) {
      await this.statePersistence.persist(currentObjectState)
    }
    if (this.logger) {
      this.logger.info(`Moving object to next state, ${currentObjectState}`)
    }
    currentObjectState.version = currentObjectState.version + 1
    return currentObjectState
  }

  public async previousState(currentObjectState: ObjectStateData) {
    if (this.statePersistence) {
      if (this.logger) {
        this.logger.info(`Fetching previous state ${currentObjectState}`)
      }
      return await this.statePersistence.fetch(currentObjectState)
    }
  }

  public enableStatePersistence(statePersistence: StatePersistence): void {
    this.statePersistence = statePersistence
  }

  public enableLogging(logger: ConflictLogger): void {
    this.logger = logger
  }
}

/**
 * Default instance of VersionedObjectState
 */
export const versionStateHandler = new VersionedObjectState()
