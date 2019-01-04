import { Config } from 'apollo-server-express'
import { VoyagerConfig } from './config/VoyagerConfig'

export function buildSchemaDirectives(apolloConfig: Config, voyagerConfig: VoyagerConfig) {
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