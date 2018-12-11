import { Request } from 'express'
import { IncomingMessage } from 'http'

export class KeycloakAuthContextProvider {

  public readonly request: any
  public readonly accessToken: any
  public readonly authenticated: boolean

  constructor ({ req }: { req: any }) {
    this.request = req
    this.accessToken = (req && req.kauth && req.kauth.grant) ? req.kauth.grant.access_token : undefined
    this.authenticated = !!(this.accessToken)
  }

  public getToken () {
    return this.accessToken
  }

  public isAuthenticated () {
    return this.authenticated
  }

  public getTokenContent () {
    return this.isAuthenticated() ? this.getToken().content : null
  }

  public hasRole (role: string) {
    return this.isAuthenticated() && this.getToken().hasRole(role)
  }
}
