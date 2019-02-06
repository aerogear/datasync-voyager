import { Config } from 'apollo-server-express'
import { CompleteVoyagerConfig } from './config/VoyagerConfig'

export function buildSchemaDirectives(apolloConfig: Config, voyagerConfig: CompleteVoyagerConfig) {
  const userDirectives = apolloConfig.schemaDirectives
  const securityDirectives = voyagerConfig.securityService.getSchemaDirectives()

  if (userDirectives && securityDirectives) {
    return { ...userDirectives, ...securityDirectives }
  }
  if (securityDirectives) {
    return securityDirectives
  }
  if (userDirectives) {
    return userDirectives
  }
}
