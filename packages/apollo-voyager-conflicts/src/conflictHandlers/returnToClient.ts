import debug from 'debug'
import { ConflictResolutionHandler } from '../api/ConflictHandler'
import { ObjectConflictError } from '../api/ObjectConflictError'
import { ObjectState } from '../api/ObjectState'
import { ObjectStateData } from '../api/ObjectStateData'
import { CONFLICT_LOGGER } from '../constants'

const logger = debug(CONFLICT_LOGGER)

/**
 * @param currentRecord the object state that the server knows about
 * @param client the object state that the client knows about
 */
export const returnToClient: ConflictResolutionHandler =
  (serverState: ObjectStateData, clientState: ObjectStateData) => {
    logger(`Conflict detected.
    Sending data to resolve conflict on client
    Server: ${serverState} client: ${clientState}`)

    throw new ObjectConflictError({
      clientData: clientState,
      serverData: serverState,
      resolvedOnServer: false
    })
  }
