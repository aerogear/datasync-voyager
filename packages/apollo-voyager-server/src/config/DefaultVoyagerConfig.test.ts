import test from 'ava'

import { DefaultVoyagerConfig } from './DefaultVoyagerConfig'
import { DefaultSecurityService } from '../security/DefaultSecurityService';
import { SecurityService } from '../security/SecurityService';

test('DefaultVoyagerConfig returns a blank security service by default', async (t) => {
  const voyagerConfig = new DefaultVoyagerConfig()

  t.truthy(voyagerConfig.securityService)
  t.truthy(voyagerConfig.securityService instanceof DefaultSecurityService)
})

test('DefaultVoyagerConfig.merge() will override default security service with user supplied one', async (t) => {
  
  class DummySecurityService implements SecurityService {
    getAuthContextProvider() {

    }
    getSchemaDirectives() {

    }
    applyAuthMiddleware() {

    }
  }

  const securityService = new DummySecurityService()
  const voyagerConfig = new DefaultVoyagerConfig().merge({ securityService })
  

  t.truthy(voyagerConfig.securityService)
  t.truthy(voyagerConfig.securityService instanceof DummySecurityService)
})