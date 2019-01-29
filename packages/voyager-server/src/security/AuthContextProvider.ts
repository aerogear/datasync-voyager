
export interface AuthContextProvider {
  isAuthenticated (): boolean
  hasRole (role: string): boolean
}
