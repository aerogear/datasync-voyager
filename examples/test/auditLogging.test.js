const test = require('ava')
const axios = require('axios')
const { server, app } = require('../audit_logging/server')

const port = 4000
app.listen({ port })

function sendQuery () {
  return axios({
    method: 'POST',
    url: `http://localhost:${port}${server.graphqlPath}`,
    data: {
      'query': '{ hello }'
    },
    headers: { 'Content-Type': 'application/json' }
  })
}

test('Sending a request to metrics example app should return OK status code and no errors', async t => {
  try {
    const res = await sendQuery()
    t.deepEqual(res.status, 200)
    t.deepEqual(res.data.errors, undefined)
  } catch (error) {
    return console.error(error)
  }
})
