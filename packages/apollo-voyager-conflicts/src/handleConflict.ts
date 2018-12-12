import debug from 'debug'
import { CONFLICT_ERROR, CONFLICT_LOGGER } from './constants'
import { SyncServerError } from './SyncServerError'

export const logger = debug(CONFLICT_LOGGER)

export class DefaultResolutionHandlers {
  /**
   *
   * @param currentRecord the object state that the server knows about
   * @param client the object state that the client knows about
   */
  public returnToClient: ConflictResolutionHandler = (currentRecord: ConflictResolutionData, client: ConflictResolutionData): SyncServerError => {
    logger(`Conflict detected. Server: ${currentRecord} client: ${client}`)
    return new SyncServerError('Conflict detected.', currentRecord, CONFLICT_ERROR)
  }
  /**
   *
   * @param currentRecord the object state that the server knows about
   * @param client the object state that the client knows about
   */
  public clientWins: ConflictResolutionHandler = (currentRecord: ConflictResolutionData, client: ConflictResolutionData): ConflictResolutionData => {
    logger(`Conflict detected. Server: ${currentRecord} client: ${client}`)
    const newVersion = currentRecord.version + 1
    const newRecord = { ...client, version: newVersion }
    return newRecord
  }
  /**
   *
   * @param currentRecord the object state that the server knows about
   * @param client the object state that the client knows about
   */
  public serverWins: ConflictResolutionHandler = (currentRecord: ConflictResolutionData, client: ConflictResolutionData): ConflictResolutionData => {
    logger(`Conflict detected. Server: ${currentRecord} client: ${client}`)
    return currentRecord
  }
  /**
   *
   * @param currentRecord the object state that the server knows about
   * @param client the object state that the client knows about
   */
  public mergeClientOntoServer: ConflictResolutionHandler = (currentRecord: ConflictResolutionData, client: ConflictResolutionData): ConflictResolutionData => {
    logger(`Conflict detected. Server: ${currentRecord} client: ${client}`)
    const newVersion = currentRecord.version + 1
    const newRecord = { ...Object.assign(currentRecord, client), version: newVersion }
    return newRecord
  }
  /**
   *
   * @param currentRecord the object state that the server knows about
   * @param client the object state that the client knows about
   */
  public mergeServerOntoClient: ConflictResolutionHandler = (currentRecord: ConflictResolutionData, client: ConflictResolutionData): ConflictResolutionData => {
    logger(`Conflict detected. Server: ${currentRecord} client: ${client}`)
    const newVersion = currentRecord.version + 1
    const newRecord = Object.assign(client, currentRecord)
    newRecord.version = newVersion
    return newRecord
  }

}

export type ConflictResolutionData = any

export type ConflictResolutionHandler = (currentRecord: ConflictResolutionData, client: ConflictResolutionData) => ConflictResolutionData | SyncServerError
