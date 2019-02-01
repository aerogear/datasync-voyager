import { ConflictListener } from '../api/ConflictListener'
import { ConflictResolution } from '../api/ConflictResolution'
import { ConflictResolutionStrategy } from '../api/ConflictResolutionStrategy'
import { ObjectState } from '../api/ObjectState'
import { ObjectStateData } from '../api/ObjectStateData'
import { GraphQLResolveInfo } from 'graphql'

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

  public hasConflict(serverState: ObjectStateData, clientState: ObjectStateData, obj: any, args: any, context: any, info: GraphQLResolveInfo) {
    if (serverState.version && clientState.version) {
      if (serverState.version !== clientState.version) {
        if (this.conflictListener) {
          this.conflictListener.onConflict('Conflict when saving data', serverState, clientState, obj, args, context, info)
        }
        return true
      }
    } else {
      throw new Error(`Supplied object is missing version field required to determine conflict. Server data: ${JSON.stringify(serverState)} Client data: ${JSON.stringify(clientState)}`)
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
