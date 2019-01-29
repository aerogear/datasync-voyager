## External REST API Integration Example

Using GraphQL it's possible to write resolvers that call some other APIs.

```js
const resolvers = {
  Query: {
    queryREST: async (obj, args, context) => {
       const result = await axios.get(YOUR_ENDPOINT_HERE, params);
       return result.data;
    }
  }
}
```

[examples/restapi/server.js](../../examples/restapi/server.js#L26-L39) shows how easy it is to integrate the consumption of a REST API endpoint into your GraphQL resolver.
