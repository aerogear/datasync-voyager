import { SecurityService } from '@aerogear/apollo-voyager-server'
import schemaDirectives from './schemaDirectives'
import KeycloakAuthContextProvider from './AuthContextProvider'
import { Router } from 'express'
import session from 'express-session'
import Keycloak from 'keycloak-connect'

export class KeycloakSecurityService implements SecurityService {
  
  public readonly keycloakConfig: any
  public readonly schemaDirectives: any
  public readonly authContextProvider: any
  public readonly log: any

  constructor (keycloakConfig: any) {
    this.keycloakConfig = keycloakConfig
    this.schemaDirectives = schemaDirectives
    this.authContextProvider = KeycloakAuthContextProvider
    this.log = console
  }

  getSchemaDirectives () {
    return this.schemaDirectives
  }

  getAuthContextProvider () {
    return this.authContextProvider
  }

  /**
  * Create keycloak middleware if needed.
  *
  * @param {*} expressRouter express router that should be used to attach auth
  * @param {string} apiPath  location of the protected api
  */
  applyAuthMiddleware (expressRouter: Router, options: any) {
    
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

    var keycloak = new Keycloak({
      store: memoryStore
    }, this.keycloakConfig)

    // Install general keycloak middleware
    expressRouter.use(keycloak.middleware({
      admin: apiPath
    }))

    // Protect the main route for all graphql services
    // Disable unauthenticated access
    expressRouter.use(apiPath, keycloak.protect())

    expressRouter.get('/token', keycloak.protect(), function (req, res) {
      if (req.session && req.session['keycloak-token']) {
        return res.json({
          'Authorization': 'Bearer ' + JSON.parse(req.session['keycloak-token']).access_token
        })
      }
      res.json({})
    })
  }
}