import { ConflictListener } from '../api/ConflictListener'
import { ConflictResolution } from '../api/ConflictResolution'
import { ConflictResolutionStrategy } from '../api/ConflictResolutionStrategy'
import { ObjectState } from '../api/ObjectState'
import { ObjectStateData } from '../api/ObjectStateData'

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
  private conflictListener: ConflictListener | undefined

  public hasConflict(serverData: ObjectStateData, clientData: ObjectStateData, resolverInfo: any) {
    if (serverData.version && clientData.version) {
      if (serverData.version !== clientData.version) {
        if (this.conflictListener) {
          this.conflictListener.onConflict('Conflict when saving data', serverData, clientData, resolverInfo)
        }
        return true
      }
    } else {
      throw new Error(`Supplied object is missing version field required to determine conflict. Server data: ${JSON.stringify(serverData)} Client data: ${JSON.stringify(clientData)}`)
    }
    return false
  }

  public nextState(currentObjectState: ObjectStateData) {
    currentObjectState.version = currentObjectState.version + 1
    return currentObjectState
  }

  public resolveOnClient(serverState: ObjectStateData, clientState: ObjectStateData) {
    return new ConflictResolution(false, serverState, clientState)
  }

  public async resolveOnServer(strategy: ConflictResolutionStrategy, serverState: ObjectStateData, clientState: ObjectStateData) {
    let resolvedState = strategy(serverState, clientState)

    if (resolvedState instanceof Promise) {
      resolvedState = await resolvedState
    }

    resolvedState.version = serverState.version
    resolvedState = this.nextState(resolvedState)

    return new ConflictResolution(true, resolvedState, clientState)
  }

  public setConflictListener(conflictListener: ConflictListener): void {
    this.conflictListener = conflictListener
  }
}

/**
 * Default instance of VersionedObjectState
 */
export const versionStateHandler = new VersionedObjectState()
