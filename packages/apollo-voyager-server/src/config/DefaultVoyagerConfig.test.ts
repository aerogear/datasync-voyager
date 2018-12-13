import test from 'ava'

import { DefaultSecurityService } from '../security/DefaultSecurityService'
import { SecurityService } from '../security/SecurityService'
import { DefaultVoyagerConfig } from './DefaultVoyagerConfig'

test('DefaultVoyagerConfig returns a blank security service by default', async (t) => {
  const voyagerConfig = new DefaultVoyagerConfig()

  t.truthy(voyagerConfig.securityService)
  t.truthy(voyagerConfig.securityService instanceof DefaultSecurityService)
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
