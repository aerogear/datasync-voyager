import { IFieldResolver } from 'graphql-tools'

export interface ResolverObject {
  [key: string]: IFieldResolver<any, any>
}

export function wrapResolvers (resolverMappings: { [key: string]: ResolverObject },
                               resolverWrapper: (resolver: IFieldResolver<any, any>) => IFieldResolver<any, any>): { [key: string]: ResolverObject } {
  const output: { [key: string]: ResolverObject } = {}

  const typeKeys = Object.keys(resolverMappings)
  for (const typeKey of typeKeys) {
    output[typeKey] = {}

    const fieldResolversForType = resolverMappings[typeKey]
    const fieldKeysForType = Object.keys(fieldResolversForType)
    for (const fieldKey of fieldKeysForType) {
      const resolverForField = fieldResolversForType[fieldKey]
      output[typeKey][fieldKey] = resolverWrapper(resolverForField)
    }
  }

  return output
}
