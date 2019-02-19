import { execute, subscribe, GraphQLSchema } from 'graphql'
import { PubSub } from 'apollo-server'
import { SubscriptionServer, ConnectionParams } from 'subscriptions-transport-ws'
import { KeycloakSecurityService } from '@aerogear/voyager-keycloak'
import { agSender } from 'unifiedpush-node-sender'
import { fromPromise } from 'apollo-link'

export class Sync {

private pushClient: any = null
private pubSub: any = null

public subscriptionServer(keycloakService: KeycloakSecurityService, schema: GraphQLSchema, httpServer: any) {
  this.pubSub = new PubSub()
  return new SubscriptionServer({
    execute,
    subscribe,
    onConnect: async (connectionParams: ConnectionParams) => {
      return await keycloakService.validateToken(connectionParams.token)
    },
    schema
  }, {
      server: httpServer,
      path: '/graphql'
    })

}

public setUpPushClient(config: any) {
  if (config) {
    const pushService = agSender(config.pushConfig)
    this.pushClient = pushService.then((client: any) => {
      return client
    })
  }
}

public getPushClient() {
  return this.pushClient
}

public publish(actionType: string, data: any, push: boolean) {
  if (push) {
    const message = {
      alert: `${actionType} ${data.title}`
    }
    const options = {
      config: {
        ttl: 3600
      }
    }
    this.pushClient.sender.send(message, options).then((response: any) => {
      console.log('Notification sent, response received ', response)
    })
  }
  this.pubSub.publish(TASKS_SUBSCRIPTION_KEY, {
    tasks: {
      action: actionType,
      task: data
    }
  })
}
}


}
