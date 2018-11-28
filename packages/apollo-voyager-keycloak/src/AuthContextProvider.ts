import { Request } from "express"
import { IncomingMessage } from "http"

export default class KeycloakAuthContextProvider {

  public readonly request : any
  public readonly accessToken : any
  public readonly authenticated: boolean

  constructor (request: any) {
    this.request = request
    this.accessToken = (request && request.kauth && request.kauth.grant) ? request.kauth.grant.access_token : undefined
    this.authenticated = !!(this.accessToken)
  }

  getToken () {
    return this.accessToken
  }

  isAuthenticated () {
    return this.authenticated
  }

  getTokenContent () {
    return this.isAuthenticated() ? this.getToken().content : null
  }

  hasRole (role: String) {
    return this.isAuthenticated() && this.getToken().hasRole(role)
  }
}
