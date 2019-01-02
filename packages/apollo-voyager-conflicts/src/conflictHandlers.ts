import debug from 'debug'
import {  CONFLICT_LOGGER } from './constants'
import { ObjectState } from './ObjectState'

export const logger = debug(CONFLICT_LOGGER)

/**
 *
 * @param helper the responsable to check the conflict and move the object to the next stage
 * @param currentRecord the object state that the server knows about
 * @param client the object state that the client knows about
 */
export const returnToClient: ConflictResolutionHandler = (helper: ObjectState, currentRecord: ConflictResolutionData, client: ConflictResolutionData): Conflict => {
  logger(`Conflict detected. Server: ${currentRecord} client: ${client}`)
  return new SyncServerError('Conflict detected.', currentRecord, CONFLICT_ERROR)
}
/**
 *
 * @param helper the responsable to check the conflict and move the object to the next stage
 * @param currentRecord the object state that the server knows about
 * @param client the object state that the client knows about
 */
export const clientWins: ConflictResolutionHandler = (helper: ObjectState, currentRecord: ConflictResolutionData, client: ConflictResolutionData): ConflictResolutionData => {
  return helper.next(client)
}
/**
 *
 * @param helper the responsable to check the conflict and move the object to the next stage
 * @param currentRecord the object state that the server knows about
 * @param client the object state that the client knows about
 */
export const serverWins: ConflictResolutionHandler = (helper: ObjectState, currentRecord: ConflictResolutionData, client: ConflictResolutionData): ConflictResolutionData => {
  logger(`Conflict detected. Server: ${currentRecord} client: ${client}`)
  return currentRecord
}
/**
 * @param helper the responsable to check the conflict and move the object to the next stage
 * @param currentRecord the object state that the server knows about
 * @param client the object state that the client knows about
 */
export const mergeClientOntoServer: ConflictResolutionHandler = (helper: ObjectState, currentRecord: ConflictResolutionData, client: ConflictResolutionData): ConflictResolutionData => {
  logger(`Conflict detected. Server: ${currentRecord} client: ${client}`)
  const serverNextState = helper.next(currentRecord)
  return Object.assign(serverNextState, client)
}
/**
 * @param helper the responsable to check the conflict and move the object to the next stage
 * @param currentRecord the object state that the server knows about
 * @param client the object state that the client knows about
 */
export const mergeServerOntoClient: ConflictResolutionHandler = (helper: ObjectState, currentRecord: ConflictResolutionData, client: ConflictResolutionData): ConflictResolutionData => {
  logger(`Conflict detected. Server: ${currentRecord} client: ${client}`)
  const clientNextState = helper.next(client)
  return Object.assign(clientNextState, currentRecord)
}

/**
 *
 */
export type ConflictResolutionData = any

export type ConflictResolutionHandler = (helper: ObjectState, currentRecord: ConflictResolutionData, client: ConflictResolutionData) => ConflictResolutionData
