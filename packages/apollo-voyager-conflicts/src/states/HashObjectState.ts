import { ConflictLogger } from '../api/ConflictLogger'
import { ObjectState } from '../api/ObjectState'
import { ObjectStateData } from '../api/ObjectStateData'
import { StatePersistence } from '../api/StatePersistence'

/**
 * Object state manager using a hashing method provided by user
 */
export class HashObjectState implements ObjectState {
  private logger: ConflictLogger | undefined
  private hash: (object: any) => string
  private statePersistence?: StatePersistence

  constructor(hashImpl: (object: any) => string) {
    this.hash = hashImpl
  }

  public hasConflict(serverData: ObjectStateData, clientData: ObjectStateData) {
    if (this.hash(serverData) !== this.hash(clientData)) {
      if (this.logger) {
        this.logger.info(`Conflict when saving data.
        current: ${serverData}, client: ${clientData}`)
      }
      return true
    }
    return false
  }

  public async nextState(currentObjectState: ObjectStateData) {
    if (this.statePersistence) {
      if (this.logger) {
        this.logger.info(`Persisting current state ${currentObjectState}`)
      }
      this.statePersistence.persist(currentObjectState)
    }
    // Hash can be calculated at any time and it is not added to object
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

  public enableLogging(logger: ConflictLogger): void {
    this.logger = logger
  }

}
