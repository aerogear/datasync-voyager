import test from 'ava'
import { VersionedObjectState } from '../src'

test('With conflict', (t) => {
  const objectState = new VersionedObjectState()
  const serverData = { name: 'AeroGear', version: 1 }
  const clientData = { name: 'Red Hat', version: 2 }
  t.deepEqual(objectState.hasConflict(serverData, clientData), true)
})

test('Without conflict', (t) => {
  const objectState = new VersionedObjectState()
  const serverData = { name: 'AeroGear', version: 1 }
  const clientData = { name: 'AeroGear', version: 1 }

  t.deepEqual(objectState.hasConflict(serverData, clientData), false)
})

test('Missing version', (t) => {
  const objectState = new VersionedObjectState()
  const serverData = { name: 'AeroGear'}
  const clientData = { name: 'AeroGear', version: 1 }

  t.deepEqual(objectState.hasConflict(serverData, clientData), false)
})

test('Next state ', async (t) => {
  const serverData = { name: 'AeroGear', version: 1 }
  const objectState = new VersionedObjectState()
  const next = await objectState.nextState(serverData)
  t.deepEqual(next.version, 2)
})
