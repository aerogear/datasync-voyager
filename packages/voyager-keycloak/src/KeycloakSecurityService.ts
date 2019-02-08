import { Router } from 'express'
import session from 'express-session'
import Keycloak from 'keycloak-connect'
import { SecurityService } from './api'
import { KeycloakAuthContextProvider } from './AuthContextProvider'
import { schemaDirectives } from './schemaDirectives'

export class KeycloakSecurityService implements SecurityService {

  public readonly keycloakConfig: any
  public readonly schemaDirectives: any
  public readonly authContextProvider: any
  public readonly log: any
  public keycloak: any

  constructor (keycloakConfig: any) {
    this.keycloakConfig = keycloakConfig
    this.schemaDirectives = schemaDirectives
    this.authContextProvider = KeycloakAuthContextProvider
    this.log = console // TODO we should come up with a good solution for this
  }

  public getSchemaDirectives () {
    return this.schemaDirectives
  }

  public getAuthContextProvider () {
    return this.authContextProvider
  }

  /**
   * Create keycloak middleware if needed.
   *
   * @param {*} expressRouter express router that should be used to attach auth
   * @param {string} apiPath  location of the protected api
   */
  public applyAuthMiddleware (expressRouter: Router, options: any) {

    if (!this.keycloakConfig) {
      return this.log.info('Keycloak authentication is not configured')
    }

    const apiPath = options && options.apiPath ? options.apiPath : '/graphql'

    this.log.info('Initializing Keycloak authentication')
    const memoryStore = new session.MemoryStore()

    expressRouter.use(session({
      secret: this.keycloakConfig.secret || 'secret',
      resave: false,
      saveUninitialized: true,
      store: memoryStore
    }))

    this.keycloak = new Keycloak({
      store: memoryStore
    }, this.keycloakConfig)

    // Install general keycloak middleware
    expressRouter.use(this.keycloak.middleware({
      admin: apiPath
    }))

    // Protect the main route for all graphql services
    // Disable unauthenticated access
    expressRouter.use(apiPath, this.keycloak.protect())

    expressRouter.get('/token', this.keycloak.protect(), function (req, res) {
      if (req.session && req.session['keycloak-token']) {
        return res.json({
          'Authorization': 'Bearer ' + JSON.parse(req.session['keycloak-token']).access_token
        })
      }
      res.json({})
    })
  }

  public async validateToken(token: string): Promise<boolean> {
    const tokenObject = this.getTokenObject(token)
    const result = await this.keycloak.grantManager.validateToken(tokenObject, 'Bearer')
    return (result === tokenObject) ? true : false
  }

  public getTokenObject(token: string): KeycloakToken {
    let fullToken: KeycloakToken = {}
    if (token) {
      try {
        const parts = token.split('.')
        fullToken = {
          header: JSON.parse(Buffer.from(parts[0], 'base64').toString()),
          content: JSON.parse(Buffer.from(parts[1], 'base64').toString()),
          signature: Buffer.from(parts[2], 'base64'),
          signed: parts[0] + '.' + parts[1],
          isExpired: () => {
            return ((fullToken.content.exp * 1000) < Date.now())
          }
        }
      } catch (err) {
        fullToken.content = {
          exp: 0
        }
      }
    }
    return fullToken
  }

}
interface KeycloakToken {
  header?: any,
  content?: any,
  signature?: any,
  signed?: string,
  isExpired?: () => boolean
}
