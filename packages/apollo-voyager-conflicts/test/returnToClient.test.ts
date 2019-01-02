import test from 'ava'
import {
  returnToClient
} from '../src'

test('Conflict Handlers - Return To Client', (t) => {
  const serverData = { name: 'AeroGear', version: 1 }
  const clientData = { name: 'Red Hat', version: 2 }

  try {
    returnToClient(serverData, clientData)
  } catch (resolutionData) {
    t.deepEqual(resolutionData.conflictInfo.resolvedOnServer, false)
  }
})
