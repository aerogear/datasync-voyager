import test from 'ava'
import {
  handleConflictOnClient
} from '../src'

test('Conflict Handlers - Return To Client', (t) => {
  const serverData = { name: 'AeroGear', version: 1 }
  const clientData = { name: 'Red Hat', version: 2 }

  try {
    handleConflictOnClient(serverData, clientData)
  } catch (resolutionData) {
    t.deepEqual(resolutionData.conflictInfo.resolvedOnServer, false)
  }
})
