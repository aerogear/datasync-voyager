import { AuditLogger, DefaultAuditLogger } from '@aerogear/voyager-audit'
import { AuthContextProvider, DefaultAuthContextProvider, SecurityService } from '@aerogear/voyager-keycloak'
import test from 'ava'
import { DefaultVoyagerConfig } from '../config/DefaultVoyagerConfig'
import { ApolloVoyagerContextProvider } from './ApolloVoyagerContextProvider'
import { GraphQLResolveInfo } from 'graphql'

test('DefaultVoyagerConfig will result in DefaultSecurityService inside the context', async (t) => {
  const { securityService, auditLogger, conflict } = new DefaultVoyagerConfig()
  const contextProvider = new ApolloVoyagerContextProvider({ securityService, auditLogger, conflict })

  const dummyRequest = {
    method: 'GET',
    url: '/graphql'
  }

  const contextFn = contextProvider.getContext()
  const context = await contextFn({ req: dummyRequest })

  const expectedContext = { request: dummyRequest, auth: new DefaultAuthContextProvider(), auditLog: new DefaultAuditLogger().auditLog, conflict }
  t.deepEqual(context, expectedContext)
})

test('Passing a custom security service will result in that service being inside the context', async (t) => {
  const { auditLogger, conflict } = new DefaultVoyagerConfig()
  class CustomAuthContextProvider implements AuthContextProvider {

    public isAuthenticated() {
      return false
    }
    public hasRole() {
      return false
    }
    public getUser() {
      return null
    }
  }

  class CustomSecurityService implements SecurityService {
    public getSchemaDirectives() {
      return null
    }
    public applyAuthMiddleware() {
      return null
    }
    public getAuthContextProvider() {
      return CustomAuthContextProvider
    }
  }

  const dummyRequest = {
    method: 'GET',
    url: '/graphql'
  }

  const securityService = new CustomSecurityService()
  const contextProvider = new ApolloVoyagerContextProvider({ securityService, auditLogger, conflict })

  const contextFn = contextProvider.getContext()
  const context = await contextFn({ req: dummyRequest })

  const expectedContext = { request: dummyRequest, auth: new CustomAuthContextProvider(), auditLog: auditLogger.auditLog, conflict }
  t.deepEqual(context, expectedContext)
})

test('Passing a custom AuditLogger class will result in a custom auditLog function in the context', async (t) => {
  t.plan(2)

  const { securityService, conflict } = new DefaultVoyagerConfig()

  class CustomAuditLogger implements AuditLogger {
    public logResolverCompletion(msg: string, success: boolean, obj: any, args: any): void {
      // no op
    }
    public auditLog(msg: string, obj: any, args: any): void {
      t.pass()
    }
    public logConflict (msg: string, serverData: any, clientData: any, obj: any, args: any, context: any, info: GraphQLResolveInfo): void {
      // no op
    }
  }

  const dummyRequest = {
    method: 'GET',
    url: '/graphql'
  }

  const auditLogger = new CustomAuditLogger()
  const contextProvider = new ApolloVoyagerContextProvider({ securityService, auditLogger, conflict })

  const contextFn = contextProvider.getContext()
  const context = await contextFn({ req: dummyRequest })

  const expectedContext = { request: dummyRequest, auth: new DefaultAuthContextProvider(), auditLog: auditLogger.auditLog, conflict }

  // Notice t.plan(2) at the beginning of the test
  // These are our two assertions. context.auditLog() will call t.pass()
  // This proves that the custom auditLog function was mounted properly
  t.deepEqual(context, expectedContext)
  context.auditLog()
})

test('plain context objects are supported and merged into the resulting context', async (t) => {
  const { securityService, auditLogger, conflict } = new DefaultVoyagerConfig()

  const userContext = {
    some: 'value',
    another: 'property'
  }

  const contextProvider = new ApolloVoyagerContextProvider({ securityService, userContext, auditLogger, conflict })

  const contextFn = contextProvider.getContext()
  const context = await contextFn({})

  t.truthy(context.auth)
  t.truthy(context.auth instanceof DefaultAuthContextProvider)
  t.is(context.some, 'value')
  t.is(context.another, 'property')
})

test('context functions are supported and the resulting object is merged into the resulting context', async (t) => {
  const { securityService, auditLogger, conflict } = new DefaultVoyagerConfig()

  const userContext = function() {
    return {
      some: 'value',
      another: 'property'
    }
  }

  const contextProvider = new ApolloVoyagerContextProvider({ securityService, userContext, auditLogger, conflict })

  const contextFn = contextProvider.getContext()
  const context = await contextFn({})

  t.truthy(context.auth)
  t.truthy(context.auth instanceof DefaultAuthContextProvider)
  t.is(context.some, 'value')
  t.is(context.another, 'property')
})

test('async context functions are supported and the resulting object is merged into the resulting context', async (t) => {
  const { securityService, auditLogger, conflict } = new DefaultVoyagerConfig()

  const userContext = async function() {
    return {
      some: 'value',
      another: 'property'
    }
  }

  const contextProvider = new ApolloVoyagerContextProvider({ securityService, userContext, auditLogger, conflict })

  const contextFn = contextProvider.getContext()
  const context = await contextFn({})

  t.truthy(context.auth)
  t.truthy(context.auth instanceof DefaultAuthContextProvider)
  t.is(context.some, 'value')
  t.is(context.another, 'property')
})

test('context Promises are supported and the resolved object is merged into the resulting context', async (t) => {
  const { securityService, auditLogger, conflict } = new DefaultVoyagerConfig()

  const userContext = new Promise((resolve, reject) => {
    resolve({
      some: 'value',
      another: 'property'
    })
  })

  const contextProvider = new ApolloVoyagerContextProvider({ securityService, userContext, auditLogger, conflict })

  const contextFn = contextProvider.getContext()
  const context = await contextFn({})

  t.truthy(context.auth)
  t.truthy(context.auth instanceof DefaultAuthContextProvider)
  t.is(context.some, 'value')
  t.is(context.another, 'property')
})

test('if the user context is not an object or function it will not be included', async (t) => {
  const { securityService, auditLogger, conflict } = new DefaultVoyagerConfig()

  const userContext = 'not an object'

  const contextProvider = new ApolloVoyagerContextProvider({ securityService, userContext, auditLogger, conflict })

  const contextFn = contextProvider.getContext()

  const dummyRequest = {
    method: 'GET',
    url: '/graphql'
  }

  const context = await contextFn({ req: dummyRequest })

  const expectedContext = { request: dummyRequest, auth: new DefaultAuthContextProvider(), auditLog: new DefaultAuditLogger().auditLog, conflict }
  t.deepEqual(context, expectedContext)
})

test('user context properties cannot override ones provided by Voyager', async (t) => {
  const { securityService, auditLogger, conflict } = new DefaultVoyagerConfig()

  const userContext = {
    auth: 'my custom auth',
    request: 'my custom request'
  }

  const contextProvider = new ApolloVoyagerContextProvider({ securityService, userContext, auditLogger, conflict })

  const dummyRequest = {
    method: 'GET',
    url: '/graphql'
  }

  const contextFn = contextProvider.getContext()
  const context = await contextFn({ req: dummyRequest })

  t.not(context.auth, userContext.auth)
  t.not(context.request, userContext)
  t.truthy(context.auth instanceof DefaultAuthContextProvider)
  t.deepEqual(context.request, dummyRequest)
})

test('if the user context function returns a null or undefined value, just the default context will be present', async (t) => {
  const { securityService, auditLogger, conflict } = new DefaultVoyagerConfig()

  const userContext = function() {
    return null
  }

  const contextProvider = new ApolloVoyagerContextProvider({ securityService, userContext, auditLogger, conflict })

  const dummyRequest = {
    method: 'GET',
    url: '/graphql'
  }

  const contextFn = contextProvider.getContext()
  const context = await contextFn({ req: dummyRequest })

  const expectedContext = { request: dummyRequest, auth: new DefaultAuthContextProvider(), auditLog: new DefaultAuditLogger().auditLog, conflict }
  t.deepEqual(context, expectedContext)
})

test('getContext throws when userContext function throws', async (t) => {
  const { securityService, auditLogger, conflict } = new DefaultVoyagerConfig()

  const errorMsg = 'error in user context'
  const userContext = function() {
    throw new Error(errorMsg)
  }

  const contextProvider = new ApolloVoyagerContextProvider({ securityService, userContext, auditLogger, conflict })

  const contextFn = contextProvider.getContext()

  await t.throwsAsync(async () => {
    await contextFn({})
  }, errorMsg)
})

test('getContext throws when userContext Promise rejects', async (t) => {
  const { securityService, auditLogger, conflict } = new DefaultVoyagerConfig()

  const errorMsg = 'error in user context'
  const userContext = new Promise((resolve, reject) => {
    reject(new Error(errorMsg))
  })

  const contextProvider = new ApolloVoyagerContextProvider({ securityService, userContext, auditLogger, conflict })

  const contextFn = contextProvider.getContext()

  await t.throwsAsync(async () => {
    await contextFn({})
  }, errorMsg)
})
