import test from 'ava'
import { VoyagerSubscriptionContextProvider } from '../src/VoyagerSubscriptionContextProvider'
import { StubSecurityService } from './stub/StubSecurityService'
import { fail } from 'assert';

test('if a Security Service is passed, the result of its onSubscriptionConnect will be in the combined context', async (t) => {

  const expectedValue = { hello: 'world' }

  class CustomSecurityService extends StubSecurityService {
    async onSubscriptionConnect() {
      return expectedValue
    }
  }
  
  const securityService = new CustomSecurityService()
  const contextProvider = new VoyagerSubscriptionContextProvider({ securityService })

  const contextFn = contextProvider.getOnConnectFunction()
  const result = await contextFn({}, {}, {})

  t.deepEqual(result, expectedValue)
})

test('if a Security Service\'s onSubscriptionConnect rejects, getOnConnect() will throw', async (t) => {

  const failureMsg = 'error in onSusbscriptionConnect'

  class CustomSecurityService extends StubSecurityService {
    onSubscriptionConnect() {
      return new Promise((relsove, reject) => {
        reject(new Error(failureMsg))
      })
    }
  }
  
  const securityService = new CustomSecurityService()
  const contextProvider = new VoyagerSubscriptionContextProvider({ securityService })

  const contextFn = contextProvider.getOnConnectFunction()

  await t.throwsAsync(async () => {
    await contextFn({}, {}, {})
  }, null, failureMsg)
})

test('the framework provided context is merged with the result from onConnect', async (t) => {

  class CustomSecurityService extends StubSecurityService {
    async onSubscriptionConnect() {
      return { hello: 'world' }
    }
  }

  function onConnect() {
    return { foo: 'bar' }
  }
  
  const securityService = new CustomSecurityService()
  const contextProvider = new VoyagerSubscriptionContextProvider({ securityService, onConnect })

  const contextFn = contextProvider.getOnConnectFunction()
  const result = await contextFn({}, {}, {})

  const expectedResult = { hello: 'world', foo: 'bar' }
  t.deepEqual(result, expectedResult)
})

test('if a Security Service is not passed, then just the onConnect return value is returned', async (t) => {

  const onConnect = function () {
    return { hello: 'world' }
  }
  
  const contextProvider = new VoyagerSubscriptionContextProvider({ onConnect })

  const contextFn = contextProvider.getOnConnectFunction()
  const result = await contextFn({}, {}, {})

  const expectedResult = { hello: 'world' }
  t.deepEqual(result, expectedResult)
})

test('onConnect can be an async function', async (t) => {

  class CustomSecurityService extends StubSecurityService {
    async onSubscriptionConnect() {
      return { hello: 'world' }
    }
  }

  async function onConnect() {
    return { foo: 'bar' }
  }
  
  const securityService = new CustomSecurityService()
  const contextProvider = new VoyagerSubscriptionContextProvider({ securityService, onConnect })

  const contextFn = contextProvider.getOnConnectFunction()
  const result = await contextFn({}, {}, {})

  const expectedResult = { hello: 'world', foo: 'bar' }
  t.deepEqual(result, expectedResult)
})

test('onConnect can return a promise', async (t) => {

  class CustomSecurityService extends StubSecurityService {
    async onSubscriptionConnect() {
      return { hello: 'world' }
    }
  }

  async function onConnect() {
    return new Promise((resolve, reject) => resolve({ foo: 'bar' }))
  }
  
  const securityService = new CustomSecurityService()
  const contextProvider = new VoyagerSubscriptionContextProvider({ securityService, onConnect })

  const contextFn = contextProvider.getOnConnectFunction()
  const result = await contextFn({}, {}, {})

  const expectedResult = { hello: 'world', foo: 'bar' }
  t.deepEqual(result, expectedResult)
})

test('the combineContexts function throws if onConnect rejects', async (t) => {

  const failureMsg = 'error in onConnect'

  class CustomSecurityService extends StubSecurityService {
    async onSubscriptionConnect() {
      return { hello: 'world' }
    }
  }

  async function onConnect() {
    return new Promise((resolve, reject) => reject(new Error(failureMsg)))
  }
  
  const securityService = new CustomSecurityService()
  const contextProvider = new VoyagerSubscriptionContextProvider({ securityService, onConnect })

  const contextFn = contextProvider.getOnConnectFunction()

  await t.throwsAsync(async () => {
    await contextFn({}, {}, {})
  }, null, failureMsg)
})

test('onConnect can return undefined', async (t) => {

  class CustomSecurityService extends StubSecurityService {
    async onSubscriptionConnect() {
      return { hello: 'world' }
    }
  }

  const onConnect = function() {}
  
  const securityService = new CustomSecurityService()
  const contextProvider = new VoyagerSubscriptionContextProvider({ securityService, onConnect })

  const contextFn = contextProvider.getOnConnectFunction()
  const result = await contextFn({}, {}, {})

  const expectedResult = { hello: 'world' }
  t.deepEqual(result, expectedResult)
})

test('VoyagerSubscriptionContextProvider constructor throws if onConnect is not a function', async (t) => {

  class CustomSecurityService extends StubSecurityService {
    async onSubscriptionConnect() {
      return { hello: 'world' }
    }
  }

  const onConnect = 'not a function'
  
  const securityService = new CustomSecurityService()

  t.throws(() => {
    //@ts-ignore
    new VoyagerSubscriptionContextProvider({ securityService, onConnect })
  }, null, 'Invalid SubscriptionServer Config - onConnect must be a function')
})

test('onConnect will override properties provided by default', async (t) => {

  class CustomSecurityService extends StubSecurityService {
    async onSubscriptionConnect() {
      return { hello: 'world' }
    }
  }

  const onConnect = function() {
    return { hello: 'universe' , foo: 'bar'}
  }
  
  const securityService = new CustomSecurityService()
  const contextProvider = new VoyagerSubscriptionContextProvider({ securityService, onConnect })

  const contextFn = contextProvider.getOnConnectFunction()
  const result = await contextFn({}, {}, {})

  const expectedResult = { hello: 'universe', foo: 'bar' }
  t.deepEqual(result, expectedResult)
})

test('onConnect can return non object values, but they won\'t be in the combined context', async (t) => {

  class CustomSecurityService extends StubSecurityService {
    async onSubscriptionConnect() {
      return { hello: 'world' }
    }
  }

  const onConnect = function() {
    return 'notAnObject'
  }
  
  const securityService = new CustomSecurityService()
  const contextProvider = new VoyagerSubscriptionContextProvider({ securityService, onConnect })

  const contextFn = contextProvider.getOnConnectFunction()
  const result = await contextFn({}, {}, {})

  const expectedResult = { hello: 'world' }
  t.deepEqual(result, expectedResult)
})

test('onConnect can return arrays and they will be destructured into the combined context', async (t) => {

  class CustomSecurityService extends StubSecurityService {
    async onSubscriptionConnect() {
      return { hello: 'world' }
    }
  }

  const a = 'hello'
  const b = 123
  const c = { foo: 'bar' }
  const onConnect = function() {
    return [a, b, c]
  }
  
  const securityService = new CustomSecurityService()
  const contextProvider = new VoyagerSubscriptionContextProvider({ securityService, onConnect })

  const contextFn = contextProvider.getOnConnectFunction()
  const result = await contextFn({}, {}, {})

  const expectedResult = { hello: 'world', 0: a, 1: b, 2: c }
  t.deepEqual(result, expectedResult)
})
