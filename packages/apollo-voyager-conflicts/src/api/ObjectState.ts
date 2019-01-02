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
   * @param serverData the data currently on the server
   * @param clientData the data the client wishes to perform some mutation with
   */
  hasConflict(serverData: ObjectStateData, clientData: ObjectStateData): boolean

  /**
   *
   * @param currentObjectState the object wish you would like to progress to its next state
   */
  nextState(currentObjectState: ObjectStateData): ObjectStateData
}
