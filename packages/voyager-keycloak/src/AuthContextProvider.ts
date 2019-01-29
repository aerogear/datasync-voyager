import { AuthContextProvider } from '@aerogear/voyager-server'
import { Request } from 'express'
import { IncomingMessage } from 'http'
export class KeycloakAuthContextProvider implements AuthContextProvider {
  public readonly request: any
  public readonly accessToken: any
  public readonly authenticated: boolean

  constructor ({ req }: { req: any }) {
    this.request = req
    this.accessToken = (req && req.kauth && req.kauth.grant) ? req.kauth.grant.access_token : undefined
    this.authenticated = !!((req && req.kauth && req.kauth.grant) ? req.kauth.grant.access_token : undefined)
  }

  public isAuthenticated () {
    return this.authenticated
  }

  public hasRole (role: string): boolean {
    return this.isAuthenticated() && this.accessToken.hasRole(role)
  }
}
