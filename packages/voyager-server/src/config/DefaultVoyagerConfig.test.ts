import { DefaultSecurityService, SecurityService, AuthContextProvider } from '@aerogear/voyager-keycloak'
import test from 'ava'
import { GraphQLResolveInfo } from 'graphql'
import { DefaultVoyagerConfig } from './DefaultVoyagerConfig'

test('DefaultVoyagerConfig returns a blank security service by default', async (t) => {
  const voyagerConfig = new DefaultVoyagerConfig()

  t.truthy(voyagerConfig.securityService)
  t.truthy(voyagerConfig.securityService instanceof DefaultSecurityService)
})

test('DefaultVoyagerConfig.merge() will override default security service with user supplied one', async (t) => {

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
  class DummySecurityService implements SecurityService {
    public getTypeDefs () {
      return ''
    }
    public getAuthContextProvider () {
      return CustomAuthContextProvider
    }
    public getSchemaDirectives () {
      return {}
    }
    public applyAuthMiddleware () {
      return null
    }
    public onSubscriptionConnect () {
      return new Promise((resolve) => resolve())
    }
  }

  const securityService = new DummySecurityService()
  const voyagerConfig = new DefaultVoyagerConfig().merge({ securityService })

  t.truthy(voyagerConfig.securityService)
  t.truthy(voyagerConfig.securityService instanceof DummySecurityService)
})


test('DefaultVoyagerConfig.merge() will still give you defaults if user explicitly sets them to null', (t) => {
  const voyagerConfig = new DefaultVoyagerConfig().merge({ securityService: null })

  t.truthy(voyagerConfig.securityService)
  t.truthy(voyagerConfig.securityService instanceof DefaultSecurityService)
})
