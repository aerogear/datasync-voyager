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

  public hasConflict(baseState: ObjectStateData, serverState: ObjectStateData, clientState: ObjectStateData) {
    if (serverState.version && clientState.version) {
      const diff = this.getDiff(baseState, serverState)
      let flag = false
      for (const key in diff) {
        if (clientState[key] && clientState[key] !== baseState[key] && clientState[key] !== diff[key]) {
          flag = true
          break
        }
      }
      return flag
    } else {
      throw new Error(`Supplied object is missing version field required to determine conflict. Server data: ${JSON.stringify(serverState)} Client data: ${JSON.stringify(clientState)}`)
    }
  }

  public merge(base: ObjectStateData, server: ObjectStateData, client: ObjectStateData) {
    const diff = this.getDiff(base, server)
    diff.version = server.version
    const updatedBase = Object.assign(base, client)
    const appliedChange = Object.assign(updatedBase, diff)
    const result = this.nextState(appliedChange)
    return result
  }

  public nextState(currentObjectState: ObjectStateData) {
    if (currentObjectState.version) {
      currentObjectState.version = currentObjectState.version + 1
    } else {
      currentObjectState.version = 1
    }
    return currentObjectState
  }

  public resolveOnClient(serverState: ObjectStateData, clientState: ObjectStateData) {
    return new ConflictResolution(false, serverState, clientState)
  }

  public reject(serverState: ObjectStateData, clientState: ObjectStateData) {
    return new ConflictResolution(true, serverState, clientState)
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

  private getDiff(baseState: ObjectStateData, serverState: ObjectStateData) {
    const diffObject: any = {}
    for (const key in serverState) {
      if (key !== 'version' && serverState[key] !== baseState[key]) {
        diffObject[key] = serverState[key]
      }
    }
    return diffObject
  }
}

/**
 * Default instance of VersionedObjectState
 */
export const versionStateHandler = new VersionedObjectState()
