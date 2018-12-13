import { SyncServerError } from '@aerogear/apollo-voyager-tools'
import debug from 'debug'
import { CONFLICT_ERROR, CONFLICT_LOGGER } from './constants'
import { ObjectState } from './ObjectState'

export const logger = debug(CONFLICT_LOGGER)

/**
 *
 * @param currentRecord the object state that the server knows about
 * @param client the object state that the client knows about
 */
export const returnToClient: ConflictResolutionHandler = (currentRecord: ConflictResolutionData, client: ConflictResolutionData): SyncServerError => {
  logger(`Conflict detected. Server: ${currentRecord} client: ${client}`)
  return new SyncServerError('Conflict detected.', currentRecord, CONFLICT_ERROR)
}
/**
 *
 * @param currentRecord the object state that the server knows about
 * @param client the object state that the client knows about
 */
export const clientWins: ConflictResolutionHandler = (helper: ObjectState, currentRecord: ConflictResolutionData, client: ConflictResolutionData): ConflictResolutionData => {
  return helper.next(client)
}
/**
 *
 * @param currentRecord the object state that the server knows about
 * @param client the object state that the client knows about
 */
export const serverWins: ConflictResolutionHandler = (helper: ObjectState, currentRecord: ConflictResolutionData, client: ConflictResolutionData): ConflictResolutionData => {
  logger(`Conflict detected. Server: ${currentRecord} client: ${client}`)
  return currentRecord
}
/**
 *
 * @param currentRecord the object state that the server knows about
 * @param client the object state that the client knows about
 */
export const mergeClientOntoServer: ConflictResolutionHandler = (helper: ObjectState, currentRecord: ConflictResolutionData, client: ConflictResolutionData): ConflictResolutionData => {
  logger(`Conflict detected. Server: ${currentRecord} client: ${client}`)
  const serverNextState = helper.next(currentRecord)
  const newRecord = Object.assign(serverNextState, client)
  return newRecord
}
/**
 *
 * @param currentRecord the object state that the server knows about
 * @param client the object state that the client knows about
 */
export const mergeServerOntoClient: ConflictResolutionHandler = (helper: ObjectState, currentRecord: ConflictResolutionData, client: ConflictResolutionData): ConflictResolutionData => {
  logger(`Conflict detected. Server: ${currentRecord} client: ${client}`)
  const clientNextState = helper.next(client)
  const newRecord = Object.assign(clientNextState, currentRecord)
  return newRecord
}

/**
 *
 */
export type ConflictResolutionData = any

export type ConflictResolutionHandler = (helper: ObjectState, currentRecord: ConflictResolutionData, client: ConflictResolutionData) => ConflictResolutionData
