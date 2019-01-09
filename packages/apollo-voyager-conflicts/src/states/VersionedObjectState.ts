import * as debug from 'debug'
import { ConflictResolution } from '../api/ConflictResolution'
import { ConflictResolutionStrategy } from '../api/ConflictResolutionStrategy'
import { ObjectState } from '../api/ObjectState'
import { ObjectStateData } from '../api/ObjectStateData'
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

  public nextState(currentObjectState: ObjectStateData) {
    this.logger(`Moving object to next state, ${currentObjectState}`)
    currentObjectState.version = currentObjectState.version + 1
    return currentObjectState
  }

  public resolveOnClient(serverState: ObjectStateData, clientState: ObjectStateData) {
    this.logger(`Conflict detected.
    Sending data to resolve conflict on client
    Server: ${serverState} client: ${clientState}`)

    return new ConflictResolution(false, serverState, clientState)
  }

  public async resolveOnServer (strategy: ConflictResolutionStrategy, serverState: ObjectStateData, clientState: ObjectStateData, baseState?: ObjectStateData) {
     let resolvedState = strategy(serverState, clientState, baseState)

     if (resolvedState instanceof Promise) {
       resolvedState = await resolvedState
     }

     resolvedState.version = serverState.version
     resolvedState = this.nextState(resolvedState)

     return new ConflictResolution(true, resolvedState, clientState, baseState)
  }
}

/**
 * Default instance of VersionedObjectState
 */
export const versionStateHandler = new VersionedObjectState()
