import { Router } from 'express'
import session from 'express-session'
import Keycloak from 'keycloak-connect'
import { KeycloakTypeDefs, KeycloakSchemaDirectives, KeycloakContext, KeycloakSubscriptionHandler, KeycloakSubscriptionContext } from 'keycloak-connect-graphql'

import {
  SecurityService,
  ApplyAuthMiddlewareOptions,
  KeycloakSecurityServiceOptions,
  AuthContextProviderClass,
  Logger,
  SchemaDirectives
} from './api'

export class KeycloakSecurityService implements SecurityService {

  public readonly keycloakConfig: any
  public readonly schemaDirectives: any
  public readonly authContextProvider: any
  public keycloak: any
  public readonly log: Logger

  constructor (keycloakConfig: any, options?: KeycloakSecurityServiceOptions) {
    this.keycloakConfig = keycloakConfig
    this.log = options && options.log ? options.log : console
    if (options && options.keycloak) {
      this.keycloak = options.keycloak
    }
  }

  public getTypeDefs(): string {
    return KeycloakTypeDefs
  }

  public getSchemaDirectives (): SchemaDirectives {
    return KeycloakSchemaDirectives
  }

  public getAuthContextProvider (): AuthContextProviderClass {
    return KeycloakContext
  }

  /**
   * Create keycloak middleware if needed.
   *
   * @param {*} expressRouter express router that should be used to attach auth
   * @param {string} apiPath  location of the protected api
   */
  public applyAuthMiddleware (expressRouter: Router, options?: ApplyAuthMiddlewareOptions) {

    if (!this.keycloakConfig) {
      return this.log.info('Keycloak authentication is not configured')
    }

    const apiPath = options && options.apiPath ? options.apiPath : '/graphql'
    const tokenEndpoint = options && options.tokenEndpoint ? options.tokenEndpoint : false

    this.log.info('Initializing Keycloak authentication')
    const memoryStore = new session.MemoryStore()

    expressRouter.use(session({
      secret: this.keycloakConfig.secret || 'secret',
      resave: false,
      saveUninitialized: true,
      store: memoryStore
    }) as any)

    if (!this.keycloak) {
      this.keycloak = new Keycloak({
        store: memoryStore
      }, this.keycloakConfig)
    }

    // Install general keycloak middleware
    expressRouter.use(this.keycloak.middleware({
      admin: apiPath
    }))

    // Protect the main route for all graphql services
    // Disable unauthenticated access
    expressRouter.use(apiPath, this.keycloak.protect())

    if (tokenEndpoint) {
      expressRouter.get('/token', this.keycloak.protect(), function (req, res) {
        if (req.session && req.session['keycloak-token']) {
          return res.json({
            'Authorization': 'Bearer ' + JSON.parse(req.session['keycloak-token']).access_token
          })
        }
        res.json({})
      })
    }
  }

  public async onSubscriptionConnect(connectionParams: any, webSocket: any, context: any): Promise<any> {
    const keycloakSubscriptionHandler = new KeycloakSubscriptionHandler({ keycloak: this.keycloak })
    const token = await keycloakSubscriptionHandler.onSubscriptionConnect(connectionParams, webSocket, context)
    const subscriptionContext = new KeycloakSubscriptionContext(token as any) // TODO fix type
    return {
      kauth: subscriptionContext,
      auth: subscriptionContext // keep backwards compatibility with voyager-server
    }
  }
}
