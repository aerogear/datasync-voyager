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

  const expectedResult = { auth: expectedValue }
  t.deepEqual(result, expectedResult)
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
  }, failureMsg)
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

  const expectedResult = { auth: { hello: 'world' }, foo: 'bar' }
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

  const expectedResult = { auth: { hello: 'world' }, foo: 'bar' }
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

  const expectedResult = { auth: { hello: 'world' }, foo: 'bar' }
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
  }, failureMsg)
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

  const expectedResult = { auth: { hello: 'world' } }
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
    new VoyagerSubscriptionContextProvider({ securityService, onConnect })
  }, 'Invalid SubscriptionServer Config - onConnect must be a function')
})

test('onConnect will override properties provided by default', async (t) => {

  class CustomSecurityService extends StubSecurityService {
    async onSubscriptionConnect() {
      return { hello: 'world' }
    }
  }

  const onConnect = function() {
    return { auth: 'myCustomAuth' , foo: 'bar'}
  }
  
  const securityService = new CustomSecurityService()
  const contextProvider = new VoyagerSubscriptionContextProvider({ securityService, onConnect })

  const contextFn = contextProvider.getOnConnectFunction()
  const result = await contextFn({}, {}, {})

  const expectedResult = { auth: 'myCustomAuth', foo: 'bar' }
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

  const expectedResult = { auth: { hello: 'world' }}
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

  const expectedResult = { auth: { hello: 'world' }, 0: a, 1: b, 2: c }
  t.deepEqual(result, expectedResult)
})

// test('Passing a custom security service will result in that service being inside the context', async (t) => {
//   const { auditLogger } = new DefaultVoyagerConfig()
//   class CustomAuthContextProvider implements AuthContextProvider {

//     public isAuthenticated() {
//       return false
//     }
//     public hasRole() {
//       return false
//     }
//     public getUser() {
//       return null
//     }
//   }

//   class CustomSecurityService implements SecurityService {
//     public getTypeDefs () {
//       return ''
//     }
//     public getSchemaDirectives() {
//       return {}
//     }
//     public applyAuthMiddleware() {
//       return null
//     }
//     public getAuthContextProvider() {
//       return CustomAuthContextProvider
//     }
//     public onSubscriptionConnect () {
//       return new Promise((resolve) => resolve())
//     }
//   }

//   const dummyRequest = {
//     method: 'GET',
//     url: '/graphql'
//   }

//   const securityService = new CustomSecurityService()
//   const contextProvider = new ApolloVoyagerContextProvider({ securityService, auditLogger })

//   const contextFn = contextProvider.getContext()
//   const context = await contextFn({ req: dummyRequest })

//   const expectedContext = { request: dummyRequest, auth: new CustomAuthContextProvider(), auditLog: auditLogger.auditLog }
//   t.deepEqual(context, expectedContext)
// })

// test('Passing a custom AuditLogger class will result in a custom auditLog function in the context', async (t) => {
//   t.plan(2)

//   const { securityService } = new DefaultVoyagerConfig()

//   class CustomAuditLogger implements AuditLogger {
//     public logResolverCompletion(msg: string, success: boolean, obj: any, args: any): void {
//       // no op
//     }
//     public auditLog(msg: string, obj: any, args: any): void {
//       t.pass()
//     }
//     public logConflict (msg: string, serverData: any, clientData: any, obj: any, args: any, context: any, info: GraphQLResolveInfo): void {
//       // no op
//     }
//   }

//   const dummyRequest = {
//     method: 'GET',
//     url: '/graphql'
//   }

//   const auditLogger = new CustomAuditLogger()
//   const contextProvider = new ApolloVoyagerContextProvider({ securityService, auditLogger })

//   const contextFn = contextProvider.getContext()
//   const context = await contextFn({ req: dummyRequest })

//   const expectedContext = { request: dummyRequest, auth: new DefaultAuthContextProvider(), auditLog: auditLogger.auditLog }

//   // Notice t.plan(2) at the beginning of the test
//   // These are our two assertions. context.auditLog() will call t.pass()
//   // This proves that the custom auditLog function was mounted properly
//   t.deepEqual(context, expectedContext)
//   context.auditLog()
// })

// test('plain context objects are supported and merged into the resulting context', async (t) => {
//   const { securityService, auditLogger } = new DefaultVoyagerConfig()

//   const userContext = {
//     some: 'value',
//     another: 'property'
//   }

//   const contextProvider = new ApolloVoyagerContextProvider({ securityService, userContext, auditLogger })

//   const contextFn = contextProvider.getContext()
//   const context = await contextFn({})

//   t.truthy(context.auth)
//   t.truthy(context.auth instanceof DefaultAuthContextProvider)
//   t.is(context.some, 'value')
//   t.is(context.another, 'property')
// })

// test('context functions are supported and the resulting object is merged into the resulting context', async (t) => {
//   const { securityService, auditLogger } = new DefaultVoyagerConfig()

//   const userContext = function() {
//     return {
//       some: 'value',
//       another: 'property'
//     }
//   }

//   const contextProvider = new ApolloVoyagerContextProvider({ securityService, userContext, auditLogger })

//   const contextFn = contextProvider.getContext()
//   const context = await contextFn({})

//   t.truthy(context.auth)
//   t.truthy(context.auth instanceof DefaultAuthContextProvider)
//   t.is(context.some, 'value')
//   t.is(context.another, 'property')
// })

// test('async context functions are supported and the resulting object is merged into the resulting context', async (t) => {
//   const { securityService, auditLogger } = new DefaultVoyagerConfig()

//   const userContext = async function() {
//     return {
//       some: 'value',
//       another: 'property'
//     }
//   }

//   const contextProvider = new ApolloVoyagerContextProvider({ securityService, userContext, auditLogger })

//   const contextFn = contextProvider.getContext()
//   const context = await contextFn({})

//   t.truthy(context.auth)
//   t.truthy(context.auth instanceof DefaultAuthContextProvider)
//   t.is(context.some, 'value')
//   t.is(context.another, 'property')
// })

// test('context Promises are supported and the resolved object is merged into the resulting context', async (t) => {
//   const { securityService, auditLogger } = new DefaultVoyagerConfig()

//   const userContext = new Promise((resolve, reject) => {
//     resolve({
//       some: 'value',
//       another: 'property'
//     })
//   })

//   const contextProvider = new ApolloVoyagerContextProvider({ securityService, userContext, auditLogger })

//   const contextFn = contextProvider.getContext()
//   const context = await contextFn({})

//   t.truthy(context.auth)
//   t.truthy(context.auth instanceof DefaultAuthContextProvider)
//   t.is(context.some, 'value')
//   t.is(context.another, 'property')
// })

// test('if the user context is not an object or function it will not be included', async (t) => {
//   const { securityService, auditLogger } = new DefaultVoyagerConfig()

//   const userContext = 'not an object'

//   const contextProvider = new ApolloVoyagerContextProvider({ securityService, userContext, auditLogger })

//   const contextFn = contextProvider.getContext()

//   const dummyRequest = {
//     method: 'GET',
//     url: '/graphql'
//   }

//   const context = await contextFn({ req: dummyRequest })

//   const expectedContext = { request: dummyRequest, auth: new DefaultAuthContextProvider(), auditLog: new DefaultAuditLogger().auditLog }
//   t.deepEqual(context, expectedContext)
// })

// test('user context properties cannot override ones provided by Voyager', async (t) => {
//   const { securityService, auditLogger } = new DefaultVoyagerConfig()

//   const userContext = {
//     auth: 'my custom auth',
//     request: 'my custom request'
//   }

//   const contextProvider = new ApolloVoyagerContextProvider({ securityService, userContext, auditLogger })

//   const dummyRequest = {
//     method: 'GET',
//     url: '/graphql'
//   }

//   const contextFn = contextProvider.getContext()
//   const context = await contextFn({ req: dummyRequest })

//   t.not(context.auth, userContext.auth)
//   t.not(context.request, userContext)
//   t.truthy(context.auth instanceof DefaultAuthContextProvider)
//   t.deepEqual(context.request, dummyRequest)
// })

// test('if the user context function returns a null or undefined value, just the default context will be present', async (t) => {
//   const { securityService, auditLogger } = new DefaultVoyagerConfig()

//   const userContext = function() {
//     return null
//   }

//   const contextProvider = new ApolloVoyagerContextProvider({ securityService, userContext, auditLogger })

//   const dummyRequest = {
//     method: 'GET',
//     url: '/graphql'
//   }

//   const contextFn = contextProvider.getContext()
//   const context = await contextFn({ req: dummyRequest })

//   const expectedContext = { request: dummyRequest, auth: new DefaultAuthContextProvider(), auditLog: new DefaultAuditLogger().auditLog }
//   t.deepEqual(context, expectedContext)
// })

// test('getContext throws when userContext function throws', async (t) => {
//   const { securityService, auditLogger } = new DefaultVoyagerConfig()

//   const errorMsg = 'error in user context'
//   const userContext = function() {
//     throw new Error(errorMsg)
//   }

//   const contextProvider = new ApolloVoyagerContextProvider({ securityService, userContext, auditLogger })

//   const contextFn = contextProvider.getContext()

//   await t.throwsAsync(async () => {
//     await contextFn({})
//   }, errorMsg)
// })

// test('getContext throws when userContext Promise rejects', async (t) => {
//   const { securityService, auditLogger } = new DefaultVoyagerConfig()

//   const errorMsg = 'error in user context'
//   const userContext = new Promise((resolve, reject) => {
//     reject(new Error(errorMsg))
//   })

//   const contextProvider = new ApolloVoyagerContextProvider({ securityService, userContext, auditLogger })

//   const contextFn = contextProvider.getContext()

//   await t.throwsAsync(async () => {
//     await contextFn({})
//   }, errorMsg)
// })
