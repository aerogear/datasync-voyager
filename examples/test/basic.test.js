const test = require('ava')
const axios = require('axios')
const { server, app } = require('../basic/server')

const port = 4000
app.listen({ port })

async function sendQuery() {
    return await axios({
        method: 'POST',
        url: `http://localhost:${port}${server.graphqlPath}`,
        data: {
            "query":"{ hello }"
        },
        headers: {'Content-Type': 'application/json'}
    });
}

test('Test basic app functionality', async t => {
  try {
    const res = await sendQuery();
    t.deepEqual(res.status, 200);
  } catch (error) {
    return console.error(error)
  }
})
