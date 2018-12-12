import { GraphQLError } from 'graphql'
const prefix = 'AgSync:'
const VALIDATION_TYPE = prefix + 'Validation'

/**
 * Represents server side error
 */
export class SyncServerError extends GraphQLError {

  public type: string
  public version: number
  public data: any

  constructor (message: string, data: any, type: string) {
    super(message)
    this.type = type || VALIDATION_TYPE
    this.data = data
    this.version = data.version
  }
}
