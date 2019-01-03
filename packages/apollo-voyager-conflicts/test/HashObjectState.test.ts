import test from 'ava'
import { HashObjectState } from '../src'

test('With conflict', (t) => {
  const objectState = new HashObjectState((data) => JSON.stringify(data))
  const serverData = { name: 'AeroGear' }
  const clientData = { name: 'Red Hat' }
  t.deepEqual(objectState.hasConflict(serverData, clientData), true)
})

test('Without conflict', (t) => {
  const objectState = new HashObjectState((data) => JSON.stringify(data))
  const serverData = { name: 'AeroGear' }
  const clientData = { name: 'AeroGear' }

  t.deepEqual(objectState.hasConflict(serverData, clientData), false)
})

test('Next state ', (t) => {
  const serverData = { name: 'AeroGear' }
  const objectState = new HashObjectState((data) => JSON.stringify(data))
  const next = objectState.nextState(serverData)
  t.deepEqual(serverData, next)
})
