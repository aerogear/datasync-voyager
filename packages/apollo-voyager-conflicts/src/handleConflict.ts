import { SyncServerError } from './detectConflict'

function RETURN_TO_CLIENT (conflict: SyncServerError, currentRecord: ConflictResolutionData, client: ConflictResolutionData): SyncServerError {
  console.warn(`Conflict detected. Server: ${currentRecord} client: ${client}`)
  return conflict
}

function CLIENT_WINS (conflict: SyncServerError, currentRecord: ConflictResolutionData, client: ConflictResolutionData): ConflictResolutionHandler {
  console.warn(`Conflict detected. Server: ${currentRecord} client: ${client}`)
  const newVersion = currentRecord.version + 1
  const newRecord = { ...client, version: newVersion }
  return newRecord
}

function SERVER_WINS (conflict: SyncServerError, currentRecord: ConflictResolutionData, client: ConflictResolutionData): SyncServerError {
  console.warn(`Conflict detected. Server: ${currentRecord} client: ${client}`)
  return conflict
}

function MERGE_CLIENT_ONTO_SERVER (conflict: SyncServerError, currentRecord: ConflictResolutionData, client: ConflictResolutionData): ConflictResolutionHandler {
  console.warn(`Conflict detected. Server: ${currentRecord} client: ${client}`)
  const newVersion = currentRecord.version + 1
  const newRecord = { ...Object.assign(currentRecord, client), version: newVersion }
  return newRecord
}

function MERGE_SERVER_ONTO_CLIENT (conflict: SyncServerError, currentRecord: ConflictResolutionData, client: ConflictResolutionData): ConflictResolutionHandler {
  console.warn(`Conflict detected. Server: ${currentRecord} client: ${client}`)
  const newVersion = currentRecord.version + 1
  const newRecord = Object.assign(client, currentRecord)
  newRecord.version = newVersion
  return newRecord
}

export const handleConflict = function (handler: ConflictResolutionHandler, conflict: SyncServerError, currentRecord: ConflictResolutionData, client: ConflictResolutionData) {
  return handler(conflict, currentRecord, client)
}

export type ConflictResolutionData = any

export type ConflictResolutionHandler = (conflict: SyncServerError, currentRecord: ConflictResolutionData, client: ConflictResolutionData) => ConflictResolutionData

export const conflictHandlers = {
  RETURN_TO_CLIENT: 'RETURN_TO_CLIENT',
  CLIENT_WINS: 'CLIENT_WINS',
  SERVER_WINS: 'SERVER_WINS',
  MERGE_CLIENT_ONTO_SERVER: 'MERGE_CLIENT_ONTO_SERVER',
  MERGE_SERVER_ONTO_CLIENT: 'MERGE_SERVER_ONTO_CLIENT'
}
