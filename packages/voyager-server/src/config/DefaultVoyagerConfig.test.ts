import { AuditLogger, DefaultAuditLogger } from '@aerogear/voyager-audit'
import { DefaultSecurityService, SecurityService } from '@aerogear/voyager-keycloak'
import test from 'ava'
import { GraphQLResolveInfo } from 'graphql'
import { DefaultVoyagerConfig } from './DefaultVoyagerConfig'

test('DefaultVoyagerConfig returns a blank security service by default', async (t) => {
  const voyagerConfig = new DefaultVoyagerConfig()

  t.truthy(voyagerConfig.securityService)
  t.truthy(voyagerConfig.securityService instanceof DefaultSecurityService)
  t.truthy(voyagerConfig.auditLogger instanceof DefaultAuditLogger)
})

test('DefaultVoyagerConfig.merge() will override default security service with user supplied one', async (t) => {

  class DummySecurityService implements SecurityService {
    public getAuthContextProvider () {
      return null
    }
    public getSchemaDirectives () {
      return null
    }
    public applyAuthMiddleware () {
      return null
    }
  }

  const securityService = new DummySecurityService()
  const voyagerConfig = new DefaultVoyagerConfig().merge({ securityService })

  t.truthy(voyagerConfig.securityService)
  t.truthy(voyagerConfig.securityService instanceof DummySecurityService)
})

test('DefaultVoyagerConfig.merge() will override default audit logger with user supplied one', async (t) => {

  class DummyAuditLogger implements AuditLogger {
    public logResolverCompletion (msg: string, success: boolean, obj: any, args: any, context: any, info: GraphQLResolveInfo): void {
      // no op
    }

    public auditLog (msg: string, obj: any, args: any, context: any, info: GraphQLResolveInfo): void {
      // no op
    }

    public logConflict (msg: string, serverData: any, clientData: any, obj: any, args: any, context: any, info: GraphQLResolveInfo): void {
      // no op
    }
  }

  const auditLogger = new DummyAuditLogger()
  const voyagerConfig = new DefaultVoyagerConfig().merge({ auditLogger })

  t.truthy(voyagerConfig.auditLogger)
  t.truthy(voyagerConfig.auditLogger instanceof DummyAuditLogger)
})

test('DefaultVoyagerConfig.merge() will still give you defaults if user explicitly sets them to null', (t) => {
  const voyagerConfig = new DefaultVoyagerConfig().merge({ securityService: null, auditLogger: null })

  t.truthy(voyagerConfig.securityService)
  t.truthy(voyagerConfig.securityService instanceof DefaultSecurityService)
  t.truthy(voyagerConfig.auditLogger instanceof DefaultAuditLogger)
})
