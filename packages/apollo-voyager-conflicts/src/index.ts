// Conflict api
export * from './api/ObjectState'
export * from './api/ObjectConflictError'
export * from './api/ObjectStateData'
export * from './api/StatePersistence'
export * from './api/ConflictLogger'

// State implementations
export * from './states/VersionedObjectState'
export * from './states/HashObjectState'
// Default API state handler
export { versionStateHandler as conflictHandler }
  from './states/VersionedObjectState'

// Conflict handlers
export * from './conflictHandlers/handleConflictOnClient'
