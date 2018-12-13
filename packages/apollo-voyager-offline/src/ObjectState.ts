import { ConflictResolutionData } from './conflictHandlers'

export interface ObjectState {
  /**
   *
   * @param serverData the data currently on the server
   * @param clientData the data the client wishes to perform some mutation with
   */
  hasConflict (serverData: ConflictResolutionData, clientData: ConflictResolutionData): boolean

  /**
   *
   * @param currentObjectState the object wish you would like to progress to its next state
   */
  next (currentObjectState: ConflictResolutionData): ConflictResolutionData
}
