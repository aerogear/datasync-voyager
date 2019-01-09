import { ConflictResolutionStrategy } from '../api/ConflictResolutionStrategy'
import { ObjectStateData } from '../api/ObjectStateData'

function clientWinsstrategy (serverState: ObjectStateData, clientState: ObjectStateData) {
  return clientState
}

function serverWinsStrategy (serverState: ObjectStateData, clientState: ObjectStateData) {
  return serverState
}

const clientWins: ConflictResolutionStrategy = clientWinsstrategy
const serverWins: ConflictResolutionStrategy = serverWinsStrategy

export const strategies = {
  clientWins,
  serverWins
}
