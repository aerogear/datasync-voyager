import { SecurityService } from './SecurityService'
import { AuthContextProvider } from './AuthContextProvider';

export class DefaultSecurityService implements SecurityService {
  
  getSchemaDirectives() {
    return null
  }

  applyAuthMiddleware() {
    return null
  }

  getAuthContextProvider() {
    return DefaultAuthContextProvider
  }
}


export class DefaultAuthContextProvider implements AuthContextProvider {
  
  isAuthenticated() {
    return false
  }

  hasRole() {
    return false
  }

  getUser() {
    return null
  }
}