import test from 'ava'
import { voyagerResolvers } from '@aerogear/apollo-voyager-server'
import { wrapResolvers } from './wrapResolvers'
import { FieldResolver } from './wrapResolvers'

test('resolvers are wrapped and wrapper function executes', (t) => {
  t.plan(4)
  const resolversWithOutSubscription = {
    Query: {
      query1: () => {
        return t.pass()
      }
    },

    Mutation: {
      mutation1: () => {
        return t.pass()
      }
    }
  }
  function resolverWrapper(resolverFn: FieldResolver) {
    return (obj: any, args: any, context: any, info: any): FieldResolver => {
      t.pass()
      return resolverFn(obj, info, args, context)
    }
  }

  const wrappedResolvers = wrapResolvers(voyagerResolvers(resolversWithOutSubscription, {} as any), resolverWrapper)
  wrappedResolvers.Query.query1({}, {}, {}, {} as any)
  wrappedResolvers.Mutation.mutation1({}, {}, {}, {} as any)
})

test('subscriptions are not wrapped', (t) => {
  t.plan(1)
  const resolversWithSubscription = {
    Subscription: {
      subscription1: () => {
        return t.pass()
      }
    }
  }
  function resolverWrapper(resolverFn: FieldResolver) {
    return (obj: any, args: any, context: any, info: any): FieldResolver => {
      t.fail()
      return resolverFn(obj, info, args, context)
    }
  }

  const wrappedResolvers = wrapResolvers(voyagerResolvers(resolversWithSubscription, {} as any), resolverWrapper)
  wrappedResolvers.Subscription.subscription1({}, {}, {}, {} as any)
})

test('all resolvers except subscriptions are wrapped', (t) => {
  t.plan(5)
  const resolversWithAll = {
    Query: {
      query1: () => {
        return t.pass()
      }
    },

    Mutation: {
      mutation1: () => {
        return t.pass()
      }
    },
    Subscription: {
      subscription1: () => {
        return t.pass()
      }
    }
  }
  function resolverWrapper(resolverFn: FieldResolver) {
    return (obj: any, args: any, context: any, info: any): FieldResolver => {
      t.pass()
      return resolverFn(obj, info, args, context)
    }
  }

  const wrappedResolvers = wrapResolvers(voyagerResolvers(resolversWithAll, {} as any), resolverWrapper)
  wrappedResolvers.Query.query1({}, {}, {}, {} as any)
  wrappedResolvers.Mutation.mutation1({}, {}, {}, {} as any)
  wrappedResolvers.Subscription.subscription1({}, {}, {}, {} as any)
})
