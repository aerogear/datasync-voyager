import { ConflictLogger } from './ConflictLogger'
import { ObjectStateData } from './ObjectStateData'
import { StatePersistence } from './StatePersistence'

/**
 * Interface for handling changing state of the object.
 * Implementors can extend this interface to provide reliable way to
 * determine if object is in conflict and calculate next state
 * (version/hash etc.) that object should have after modification.
 */
export interface ObjectState {

  /**
   * @param serverData the data currently on the server
   * @param clientData the data the client wishes to perform some mutation with
   */
  hasConflict(serverData: ObjectStateData, clientData: ObjectStateData): boolean

  /**
   * @param currentObjectState the object wish you would like to progress to its next state
   */
  nextState(currentObjectState: ObjectStateData): Promise<ObjectStateData>

  /**
   * Gets previous state from state persistence api
   *
   * @see enableDataHistory to enable state persistence api
   * @param currentObjectState
   */
  previousState(currentObjectState: ObjectStateData): Promise<ObjectStateData>

  /**
   * Enables state persistence for ObjectState
   * State persistence allows to retrieve previous versions of the
   * objects in order to resolve data conflicts
   *
   * @param statePersistence implementation for state persistence
   */
  enableStatePersistence(statePersistence: StatePersistence): void

  /**
   * Enable logging for conflict resolution package
   * @param logger - logger implementation
   */
  enableLogging(logger: ConflictLogger): void
}
