const test = require('ava')
const axios = require('axios')
const { server, app } = require('../conflicts/server')

const port = 4000
app.listen({ port })

const testQueries = {
  greeting: 'query { greeting }',
  mutation: (v) => `mutation { changeGreeting(msg: "Hello${v}", version: ${v}) {msg version}}`
}

function sendQuery (query) {
  return axios({
    method: 'POST',
    url: `http://localhost:${port}${server.graphqlPath}`,
    data: {
      'query': query
    },
    headers: { 'Content-Type': 'application/json' }
  })
}

test.serial('Sending a query should not return error', async t => {
  try {
    const res = await sendQuery(testQueries.greeting)
    t.deepEqual(res.status, 200)
    t.deepEqual(res.data.errors, undefined)
  } catch (error) {
    return console.error(error)
  }
})

test.serial('Sending a mutation with correct version number should not return error', async t => {
  try {
    const res = await sendQuery(testQueries.mutation(1))
    t.deepEqual(res.status, 200)
    t.deepEqual(res.data.errors, undefined)
  } catch (error) {
    return console.error(error)
  }
})

test.serial(`Sending a query should return the new version of greeting response`, async t => {
  try {
    const res = await sendQuery(testQueries.greeting)
    t.deepEqual(res.status, 200)
    t.deepEqual(res.data.errors, undefined)
    t.deepEqual(res.data.data.greeting, 'Hello1')
  } catch (error) {
    return console.error(error)
  }
})

test.serial('Sending a mutation with existing version number should return error', async t => {
  try {
    const res = await sendQuery(testQueries.mutation(1))
    t.deepEqual(res.status, 200)
    t.true(res.data.errors !== undefined)
  } catch (error) {
    return console.error(error)
  }
})

test.serial('Sending a mutation following version number should not return error', async t => {
  try {
    const res = await sendQuery(testQueries.mutation(3))
    t.deepEqual(res.status, 200)
    t.deepEqual(res.data.errors, undefined)
  } catch (error) {
    return console.error(error)
  }
})

test.serial(`Sending a query again should return the newest version of greeting response`, async t => {
  try {
    const res = await sendQuery(testQueries.greeting)
    t.deepEqual(res.status, 200)
    t.deepEqual(res.data.errors, undefined)
    t.deepEqual(res.data.data.greeting, 'Hello3')
  } catch (error) {
    return console.error(error)
  }
})
