## Subscriptions

## Prerequisites

* Ensure the examples can be run by following the [Setting up Your Local Environment](../../doc/guides/local-development.md) guide.

## Running the Example

`subscriptions/index.js` is the simplest example of how to use the `@aerogear/voyager-subscriptions` module to set up subscriptions in a server.

```
$ node subscriptions/index.js
🚀 Server ready at http://localhost:4000/graphql
```

Open [http://localhost:4000/graphql](http://localhost:4000/graphql) and you will see the GraphQL Playground. This is a space where you can try out queries and see the results.

Open two tabs in the GraphQL playground.

In the first tab, enter the following subscription/.

```
subscription s1 {
  hello
}

In the GraphQL playground you see the word **Listening...**, which indicates the subscription is active.

In the second tab, try the following query a couple of times.

```
query hello {
  hello
}
```

Switch back to the first tab. You should see some new data being received from the subscription.


