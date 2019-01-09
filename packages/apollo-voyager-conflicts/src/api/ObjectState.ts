import { ConflictLogger } from './ConflictLogger'
import { ConflictResolution } from './ConflictResolution'
import { ConflictResolutionStrategy } from './ConflictResolutionStrategy'
import { ObjectStateData } from './ObjectStateData'

/**
 * Interface for handling changing state of the object.
 * Implementors can extend this interface to provide reliable way to
 * determine if object is in conflict and calculate next state
 * (version/hash etc.) that object should have after modification.
 */
export interface ObjectState {

  /**
   *
   * @param serverState the data currently on the server
   * @param clientState the data the client wishes to perform some mutation with
   */
  hasConflict(serverState: ObjectStateData, clientState: ObjectStateData): boolean

  /**
   *
   * @param objectState the object wish you would like to progress to its next state
   */
  nextState(objectState: ObjectStateData): ObjectStateData

  /**
   *
   * @param serverState the current state of the object on the server
   * @param clientState the state of the object the client wishes to perform some mutation with
   * @param baseState the base object state that the client state is based off.
   */
  resolveOnClient(serverState: ObjectStateData, clientState: ObjectStateData): ConflictResolution

  /**
   *
   * @param serverState the current state of the object on the server
   * @param clientState the state of the object the client wishes to perform some mutation with
   * @param baseState the base object state that the client state is based off.
   */
  resolveOnServer (strategy: ConflictResolutionStrategy, serverState: ObjectStateData, clientState: ObjectStateData, baseState?: ObjectStateData): Promise<ConflictResolution>

  /**
   * Enable logging for conflict resolution package
   * @param logger - logger implementation
   */
  enableLogging(logger: ConflictLogger): void
}
