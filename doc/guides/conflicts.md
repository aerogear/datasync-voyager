## Conflict resolution

## Prerequisites:

- GraphQL server with resolvers
- Database or any other form of data storage that can cause data conflicts

## Pluggable conflict resolution

Pluggable conflict resolution is an concept that allows developers to define handling for collisions between data sent to resolver
and data that is currently stored in the server.

Pluggable conflict resolution supports following implementations:
- `VersionedObjectState`: depends on version field supplied in objects (used by default when importing conflictHandler)
- `HashObjectState`: depends on hash calculated from entire object

## Enabling conflict resolution mechanism

To enable conflict resolution developers need to use one of the pluggable conflict resolution strategies
in each individual resolver. Depending on strategy developers will need to provide additional details.

### Version based conflict resolution

1. Add conflict package dependency to project

```javascript
const { conflictHandler } = require('@aerogear/apollo-voyager-conflicts')
```

2. Add version field to GraphQL type that should support conflict resolution

```graphql
type Greeting {
    msg: String
    version: Int
  }
```

3. Add example mutations

```graphql
  type Mutation {
    changeGreeting(msg: String!, version: Int!): Greeting
  }
```

3. Implement resolver for mutation

Every conflict can be handled using set of predefined steps

```javascript
    // 1. Read data from data source
    // 2. Check for conflicts
    if (conflictHandler.hasConflict(serverData,clientData)) {
      // 3. Resolve conflict (client or server) and return error to client
      return await conflictHandler.resolveOnClient(serverData, clientData).response
    }
    // 5. Call next state to update
    greeting = conflictHandler.nextState(clientData)
    // 6. Save object to data source
```

Resolvers can be implemented to handle conflicts on client or server.
Depending on handling resolver implementation will differ.
Please see chapter bellow for individual implementations.

## Different options for resolving conflicts

Conflicts can be resolved on server or client depending on resolver implementation

### Resolving conflicts on the client

```javascript
// Data
const serverState = ...

changeGreeting: async (obj, clientState, context, info) => {
    if (conflictHandler.hasConflict(serverState, args)) {
      const clientState = args
      return await conflictHandler.resolveOnClient(serverState, clientState).response
    }
    serverState = conflictHandler.nextState(clientState)
    return serverState
}
```

### Resolving conflicts on the server

```javascript
// Data
const serverState = ...

 changeGreeting: async (obj, clientState, context, info) => {
      if (conflictHandler.hasConflict(serverState, clientState)) {
        const strategy = customGreetingResolutionStrategy
        const { resolvedState, response } = await conflictHandler.resolveOnServer(strategy, serverState, clientState)
        serverState = resolvedState
        return response
      }
      serverState = conflictHandler.nextState(clientState)
      return serverState
    }
```

> Note: For complete implementation see example application located in `examples/conflicts` folder.


### Client conflict implementation

See [Voyager Client documentation](https://github.com/aerogear/aerogear-js-sdk/tree/master/packages/sync#conflicts)
