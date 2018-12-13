import test from 'ava'

import { KeycloakAuthContextProvider } from './KeycloakAuthContextProvider'

test('provider.getToken() returns request.kauth.grant.access_token', (t) => {
  const token = {
    someField: 'foo'
  }
  const request = {
    kauth: {
      grant: {
        access_token: token
      }
    }
  }

  const provider = new KeycloakAuthContextProvider(request)
  t.truthy(provider.getToken())
  t.deepEqual(provider.request, request)
  t.deepEqual(provider.getToken(), token)
})

test('provider.getToken() returns null when request.kauth is not available', (t) => {
  const request = {}

  const provider = new KeycloakAuthContextProvider(request)
  t.falsy(provider.getToken())
})

test('provider.isAuthenticated() returns true when there is a token', (t) => {
  const token = {
    someField: 'foo'
  }
  const request = {
    kauth: {
      grant: {
        access_token: token
      }
    }
  }

  const provider = new KeycloakAuthContextProvider(request)
  t.true(provider.isAuthenticated())
})

test('provider.isAuthenticated() returns false when there is no token', (t) => {
  const request = {}

  const provider = new KeycloakAuthContextProvider(request)
  t.false(provider.isAuthenticated())
})

test('provider.getTokenContent() returns the content when there is a token', (t) => {
  const token = {
    someField: 'foo',
    content: {'a': 'b'}
  }
  const request = {
    kauth: {
      grant: {
        access_token: token
      }
    }
  }

  const provider = new KeycloakAuthContextProvider(request)
  t.truthy(provider.getTokenContent())
  t.deepEqual(provider.getTokenContent(), {'a': 'b'})
})

test('provider.getTokenContent() returns null when there is no token', (t) => {
  const request = {}

  const provider = new KeycloakAuthContextProvider(request)
  t.falsy(provider.getTokenContent())
})

test('provider.hasRole() returns true when there is a token and the token has the role', (t) => {
  const token = {
    someField: 'foo',
    content: {'a': 'b'},
    hasRole: (role: string) => {
      return role === 'admin'
    }
  }
  const request = {
    kauth: {
      grant: {
        access_token: token
      }
    }
  }

  const provider = new KeycloakAuthContextProvider(request)
  t.true(provider.hasRole('admin'))
})

test('provider.hasRole() returns false when there is a token but the token dont have the role', (t) => {
  const token = {
    someField: 'foo',
    content: {'a': 'b'},
    hasRole: (role: string) => {
      return role === 'admin'
    }
  }
  const request = {
    kauth: {
      grant: {
        access_token: token
      }
    }
  }

  const provider = new KeycloakAuthContextProvider(request)
  t.false(provider.hasRole('super-uber-admin'))
})

test('provider.hasRole() returns false when there is no token', (t) => {
  const request = {}

  const provider = new KeycloakAuthContextProvider(request)
  t.false(provider.hasRole('foo'))
})
