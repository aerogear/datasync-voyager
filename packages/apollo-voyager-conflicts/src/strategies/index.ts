import { ConflictResolutionStrategy } from '../api/ConflictResolutionStrategy'
import { ObjectStateData } from '../api/ObjectStateData'

export interface StrategyMap {[key: string]: ConflictResolutionStrategy}

function clientWins (serverState: ObjectStateData, clientState: ObjectStateData) {
  return clientState
}

function serverWins (serverState: ObjectStateData, clientState: ObjectStateData) {
  return serverState
}

export const strategies: StrategyMap = {
  clientWins,
  serverWins
}
