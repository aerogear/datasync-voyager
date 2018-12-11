import { GraphQLError } from 'graphql'
import { ConflictResolutionData } from './handleConflict'
const prefix = 'AgSync:'
const CONFLICT_TYPE = prefix + 'DataConflict'
const VALIDATION_TYPE = prefix + 'Validation'

/**
 * Represents server side error
 */
export class SyncServerError extends GraphQLError {

  public type: string
  public version: number
  public data: any

  constructor (message: string, data: any, type: string) {
    super(message)
    this.type = type || VALIDATION_TYPE
    this.data = data
    this.version = data.version
  }
}

// Default strategy for conflict resolution
// Method accept server and client data and return true if conflict detected
const defaultConflictDetection = (server: ConflictResolutionData, client: ConflictResolutionData) => {
  if (server.version && client.version) {
    if (server.version !== client.version) {
      return new SyncServerError('Conflict when saving data', server, CONFLICT_TYPE)
    }
  } else {
    console.trace('conflict resolution not enabled')
  }
}

export { defaultConflictDetection as detectConflict }
