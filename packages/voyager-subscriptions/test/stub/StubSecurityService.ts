
import { AuthContextProvider, DefaultAuthContextProvider, SecurityService } from '@aerogear/voyager-keycloak'

class StubAuthContextProvider implements AuthContextProvider {

  public isAuthenticated() {
    return false
  }
  public hasRole() {
    return false
  }
  public getUser() {
    return null
  }
}

export class StubSecurityService implements SecurityService {
  public getTypeDefs () {
    return ''
  }
  public getAuthContextProvider () {
    return StubAuthContextProvider
  }
  public getSchemaDirectives () {
    return {}
  }
  public applyAuthMiddleware () {
    return null
  }
  public onSubscriptionConnect () {
    return new Promise((resolve) => resolve())
  }
}