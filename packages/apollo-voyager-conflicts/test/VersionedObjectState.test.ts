import { expect } from 'chai'
import 'mocha'
import { VersionedObjectState } from '../src'

describe('Versioned ObjectState', () => {

  it('With conflict', () => {
    const objectState = new VersionedObjectState()
    const serverData = {name: 'AeroGear', version: 1}
    const clientData = {name: 'Red Hat', version: 2}

    expect(objectState.hasConflict(serverData, clientData)).eq(true)
  })

  it('Without conflict', () => {

    const objectState = new VersionedObjectState()
    const serverData = {name: 'AeroGear', version: 1}
    const clientData = {name: 'AeroGear', version: 1}

    expect(objectState.hasConflict(serverData, clientData)).eq(false)
  })

  it('Next stage ', () => {
    const serverData = {name: 'AeroGear', version: 1}
    const objectState = new VersionedObjectState()
    objectState.next(serverData)
    expect(serverData.version).eq(2)
  })
})
