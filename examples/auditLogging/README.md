## Audit Logging Example

`auditLogging/index.js` is the example of how to use audit logging feature with the `apollo-voyager-server` framework.

```
$ node auditLogging/index.js
🚀 Server ready at http://localhost:4000/graphql
```

Open [http://localhost:4000/graphql](http://localhost:4000/graphql) and you will see the GraphQL Playground. This is a space where you can try out queries and see the results.

Try the following query.

```
query hello {
  hello
}
```

You should see log message in the application console.
