import { IFieldResolver } from 'graphql-tools'

export interface FieldResolver extends IFieldResolver<any, any> {
}

export interface ResolverObject {
  [key: string]: FieldResolver
}

export interface ResolverMappings {
  [key: string]: ResolverObject
}

export type ResolverWrapper = (resolver: FieldResolver) => FieldResolver

export function wrapResolvers (resolverMappings: ResolverMappings,
                               resolverWrapper: ResolverWrapper): ResolverMappings {
  const output: ResolverMappings = {}

  const typeKeys = Object.keys(resolverMappings)
  for (const typeKey of typeKeys) {
    if (typeKey !== 'Subscription') {
      output[typeKey] = {}
      const fieldResolversForType = resolverMappings[typeKey]
      const fieldKeysForType = Object.keys(fieldResolversForType)
      for (const fieldKey of fieldKeysForType) {
        const resolverForField = fieldResolversForType[fieldKey]
        output[typeKey][fieldKey] = resolverWrapper(resolverForField)
      }
     }
  }

  return output
}
