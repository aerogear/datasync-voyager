import { expect } from 'chai'
import 'mocha'
import {
  returnToClient
} from '../src'

describe('Conflict Handlers', () => {

  it('Return To Client', () => {
    const serverData = { name: 'AeroGear', version: 1 }
    const clientData = { name: 'Red Hat', version: 2 }

    try {
      returnToClient(serverData, clientData)
    } catch (resolutionData) {
      expect(resolutionData.conflictInfo.resolvedOnServer).eq(false)
    }
  })
})
