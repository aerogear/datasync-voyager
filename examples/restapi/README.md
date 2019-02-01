## External REST API Integration Example

Using GraphQL it's possible to write resolvers that call some other APIs.

```js
const resolvers = {
  Query: {
    queryREST: async (obj, args, context) => {
      try {
        const result = await axios.get(YOUR_ENDPOINT_HERE, params);
        return result.data;
      } catch (e) {
        throw new GraphQLError("some error");
      }
    }
  }
};
```

It can happen that external API is down or some other error occured. If you handle the error, you can throw your own exception and it will get passed to client as an `errors` field.

```js
{
  "errors": [
    {
      "message": "some error"
      ⋮
      ⋮
    }
  ],
  "data":  {
    "queryREST": null
  }
```

[examples/restapi/server.js](../../examples/restapi/server.js#L26-L39) shows how easy it is to integrate the consumption of a REST API endpoint into your GraphQL resolver.
