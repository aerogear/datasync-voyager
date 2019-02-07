const test = require('ava')
const { server, app } = require('../basic/server')

const port = 4000
app.listen({ port })

const sendQuery = query =>
  require('./util/sendQuery')(query, server.graphqlPath, port)

test('Sending a request to basic example app should return OK status code and no errors', async t => {
  try {
    const res = await sendQuery('{hello}')
    t.deepEqual(res.status, 200)
    t.deepEqual(res.data.errors, undefined)
  } catch (error) {
    return console.error(error)
  }
})
