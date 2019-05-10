const { createSubscriptionServer } = require('../../packages/voyager-subscriptions')
const { app, schema } = require('./server')

const port = 4000

const server = app.listen(port, () => {
  console.log(`🚀 Server ready at http://localhost:${port}/graphql`)

  createSubscriptionServer({ schema }, {
    server,
    path: '/graphql'
  })
})
