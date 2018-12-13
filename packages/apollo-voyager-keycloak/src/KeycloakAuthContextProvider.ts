export class KeycloakAuthContextProvider {

  public readonly request: any
  public readonly accessToken: any
  public readonly authenticated: boolean

  constructor (request: any) {
    this.request = request
    this.accessToken = (request && request.kauth && request.kauth.grant) ? request.kauth.grant.access_token : undefined
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
