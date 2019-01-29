import test from 'ava'

import { buildPath } from './buildPath'

test('buildPath should never throw error', t => {
  t.is(buildPath(undefined), '')
  t.is(buildPath(null), '')
  t.is(buildPath(''), '')
  t.is(buildPath(1), '')
  t.is(buildPath({}), '')
})

test('buildPath should build path successfully', t => {
  t.deepEqual(
    buildPath(
      {
        key: 'allMemes'
      }
    ),
    'allMemes')

  t.deepEqual(
    buildPath(
      {
        key: 'owner',
        prev: {
          key: '0',
          prev: {
            key: 'allMemes'
          }
        }
      }
    ),
    'allMemes.0.owner')
})
