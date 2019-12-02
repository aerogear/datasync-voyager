const test = require('ava')
const gql = require('graphql-tag')
const TestApolloClient = require('./util/TestApolloClient')

const { app, schema } = require('../subscriptions/server')
const { createSubscriptionServer } = require('../../packages/voyager-subscriptions')
const sleep = require('./util/sleep')

const port = 4000

// ensure exceptions / issues with the test gets logged properly.
// ava tends to swallow them
process.on('uncaughtException', (e) => {
  console.error(e)
  process.exit(1)
})

// Set up the subscription server
test.before(t => {
  return new Promise((resolve, reject) => {
    const server = app.listen(port, () => {
      console.log('listening')
      createSubscriptionServer({ schema }, {
        server,
        path: '/graphql'
      })
      resolve()
    })
  })
})

const clientWrapper = new TestApolloClient(`localhost:${port}`)

test('Sending a request to basic example app should return OK status code and no errors', async t => {
  const result = await clientWrapper.client.query({
    query: gql`
      query q1 {
        hello
      }
    `
  })
  t.deepEqual(result.data, { hello: 'Hello world' })
})

test('Basic Subscricption will return a result', async t => {
  const subscription = clientWrapper.subscribe(gql`
      subscription s1 {
        hello
      }
    `)

  // necessary hack to ensure the subscription is established before sending the query
  await sleep(100)

  await clientWrapper.client.query({
    query: gql`
        query q1 {
          hello
        }
      `
  })

  const result = await subscription
  t.truthy(result.data)
  t.deepEqual(result.data, { hello: 'Hello world' })
})
