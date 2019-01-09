import { ConflictLogger } from '../api/ConflictLogger'
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
  private logger: ConflictLogger | undefined

  public hasConflict(serverData: ObjectStateData, clientData: ObjectStateData) {
    if (serverData.version && clientData.version) {
      if (serverData.version !== clientData.version) {
        if (this.logger) {
          this.logger.info(`Conflict when saving data.
          current: ${ JSON.stringify(serverData)},
          client: ${JSON.stringify(clientData)}`)
        }
        return true
      }
    } else if (this.logger) {
      this.logger.info(
        `Supplied object is missing version field required to determine conflict
         server: ${JSON.stringify(serverData)}
         client: ${JSON.stringify(clientData)}`)
    }
    return false
  }

  public nextState(currentObjectState: ObjectStateData) {
    if (this.logger) {
      this.logger.info(`Moving object to next state,
      ${JSON.stringify(currentObjectState)}`)
    }
    currentObjectState.version = currentObjectState.version + 1
    return currentObjectState
  }

  public resolveOnClient(serverState: ObjectStateData, clientState: ObjectStateData) {
    return new ConflictResolution(false, serverState, clientState)
  }

  public async resolveOnServer(strategy: ConflictResolutionStrategy, serverState: ObjectStateData, clientState: ObjectStateData, baseState?: ObjectStateData) {
    let resolvedState = strategy(serverState, clientState, baseState)

    if (resolvedState instanceof Promise) {
      resolvedState = await resolvedState
    }

    resolvedState.version = serverState.version
    resolvedState = this.nextState(resolvedState)

    return new ConflictResolution(true, resolvedState, clientState, baseState)
  }

  public enableLogging(logger: ConflictLogger): void {
    this.logger = logger
  }
}

/**
 * Default instance of VersionedObjectState
 */
export const versionStateHandler = new VersionedObjectState()
