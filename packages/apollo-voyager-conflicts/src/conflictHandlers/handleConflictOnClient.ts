import debug from 'debug'
import { ConflictResolutionHandler } from '../api/ConflictHandler'
import { ObjectConflictError } from '../api/ObjectConflictError'
import { ObjectStateData } from '../api/ObjectStateData'

/**
 * @param currentRecord the object state that the server knows about
 * @param client the object state that the client knows about
 */
export const handleConflictOnClient: ConflictResolutionHandler =
  (serverState: ObjectStateData, clientState: ObjectStateData) => {
    throw new ObjectConflictError({
      clientData: clientState,
      serverData: serverState,
      resolvedOnServer: false
    })
  }
