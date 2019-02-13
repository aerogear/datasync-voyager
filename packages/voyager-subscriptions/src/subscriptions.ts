import { execute, subscribe } from 'graphql'
import { SubscriptionServer, ConnectionParams } from 'subscriptions-transport-ws'
import { KeycloakSecurityService } from '@aerogear/voyager-keycloak'

export function subscriptionServer(keycloakService: KeycloakSecurityService) {
  return new SubscriptionServer({
    execute,
    subscribe,
    onConnect: async (connectionParams: ConnectionParams) => {
      return await keycloakService.validateToken(connectionParams)
    },
    schema: apolloServer.schema
  }, {
      server: httpServer,
      path: '/graphql'
    });

}
