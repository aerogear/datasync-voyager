import test from 'ava'
import auditLogger from '../../apollo-voyager-audit'
import metrics from '../../apollo-voyager-metrics'
import { voyagerResolvers } from '../../apollo-voyager-server'
import { VoyagerConfig } from '../../apollo-voyager-server/dist/config/VoyagerConfig'
import { wrapResolvers } from './wrapResolvers'
import { FieldResolver } from './wrapResolvers'

function resolverFunction() {
  return (): FieldResolver => {
    return (obj, args, context, info) => {
      return context
    }
  }
}

const resolversWithOutSubscription = {
  Query: {
    allTasks: async (context: any) => {
      return context.db.select().from('tasks')
    }
  },

  Mutation: {
    createTask: async (args: any, context: any) => {
      const result = await context.db('tasks').insert(args).returning('*').then((rows: any) => rows[0])
      return result
    }
  }
}

const resolversWithSubscription = {
  ...resolversWithOutSubscription,
  Subscription: {
    something: async () => {
      const something = 'test'
      return something
    }
  }
}

test('Without subscriptions', (t) => {
  const config: VoyagerConfig = {
    auditLogger,
    metrics,
    securityService: {} as any
  }
  const result = wrapResolvers(voyagerResolvers(resolversWithOutSubscription, config), resolverFunction())
  t.is(result.Subscription, undefined)
})

test('With subscriptions', (t) => {
  const config: VoyagerConfig = {
    auditLogger,
    metrics,
    securityService: {} as any
  }
  const result = wrapResolvers(voyagerResolvers(resolversWithSubscription, config), resolverFunction())
  t.is(result.Subscription, undefined)
})
