import debug from 'debug'
import { CONFLICT_ERROR, CONFLICT_LOGGER } from './constants'
import { ConflictResolutionData } from './handleConflict'
import { SyncServerError } from './SyncServerError'

interface ObjectState {
  serverData: ConflictResolutionData,
  clientData: ConflictResolutionData
  detect (): SyncServerError | undefined
}

// Default strategy for conflict resolution
// Method accept server and client data and return true if conflict detected
export class VersionFieldConflict implements ObjectState {
  public serverData: ConflictResolutionData
  public clientData: ConflictResolutionData

  private logger = debug(CONFLICT_LOGGER)
  constructor (objectState: ObjectState) {
    this.clientData = objectState.clientData
    this.serverData = objectState.serverData
  }

  public detect = () => {
    if (this.serverData.version && this.clientData.version) {
      if (this.serverData.version !== this.clientData.version) {
        this.logger(`Conflict when saving data. current: ${this.serverData}, client: ${this.clientData}`)
        return new SyncServerError('Conflict when saving data', this.serverData, CONFLICT_ERROR)
      }
    } else {
      this.logger('conflict resolution not enabled')
    }
  }
}
