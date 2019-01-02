import { expect } from 'chai'
import 'mocha'
import {
  clientWins,
  mergeClientOntoServer,
  mergeServerOntoClient,
  returnToClient,
  serverWins,
  VersionedObjectState
} from '../src'
import { CONFLICT_ERROR } from '../src/constants'

describe('Conflict Handlers', () => {

  it('Return To Client', () => {

    const objectState = new VersionedObjectState()
    const serverData = {name: 'AeroGear', version: 1}
    const clientData = {name: 'Red Hat', version: 2}

    const resolutionData = returnToClient(objectState, serverData, clientData)

    expect(resolutionData.data).eq(serverData)
    expect(resolutionData.type).eq(CONFLICT_ERROR)
  })

  it('Client Wins', () => {

    const objectState = new VersionedObjectState()
    const serverData = {name: 'AeroGear', version: 1}
    const clientData = {name: 'Red Hat', version: 2}

    const resolutionData = clientWins(objectState, serverData, clientData)

    expect(resolutionData).eq(clientData)
  })

  it('Server Wins', () => {

    const objectState = new VersionedObjectState()
    const serverData = {name: 'AeroGear', version: 1}
    const clientData = {name: 'Red Hat', version: 2}

    const resolutionData = serverWins(objectState, serverData, clientData)

    expect(resolutionData).eq(serverData)
  })

  it('Merge Client Onto Server', () => {

    const objectState = new VersionedObjectState()
    const serverData = {name: 'AeroGear Server', version: 1}
    const clientData = {name: 'AeroGear Client', someKey: 'SomeValue', version: 2}
    const resolutionData = mergeClientOntoServer(objectState, serverData, clientData)

    expect(serverData).eq(resolutionData)
    expect(resolutionData).that.contains({
      name: 'AeroGear Client',
      version: 2,
      someKey: 'SomeValue'
    })
  })

  it('Merge Server Onto Client', () => {

    const objectState = new VersionedObjectState()
    const serverData = {name: 'AeroGear Server', someKey: 'SomeValue', version: 2}
    const clientData = {name: 'AeroGear Client', version: 1}
    const resolutionData = mergeServerOntoClient(objectState, serverData, clientData)

    expect(clientData).eq(resolutionData)
    expect(resolutionData).that.contains({
      name: 'AeroGear Server',
      version: 2,
      someKey: 'SomeValue'
    })
  })

})
