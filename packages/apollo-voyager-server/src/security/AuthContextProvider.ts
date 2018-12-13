

export interface AuthContextProvider {
  isAuthenticated(): boolean
  hasRole(role: string): boolean
  getUser(): any // User???
}