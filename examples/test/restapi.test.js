const test = require('ava')
const { server, app } = require('../restapi/server')
const port = 4000
app.listen({ port })
const sendQuery = query =>
  require('./util/sendQuery')(query, server.graphqlPath, port)

const query = `
query getCarModels {
  getCarModels(brand:"Tesla") {
    Model_ID
    Make_Name
    Model_Name
  }
}
`

test('Sending a query for Tesla', async t => {
  try {
    const res = await sendQuery(query)
    t.deepEqual(res.status, 200)
    t.deepEqual(res.data.errors, undefined)
    const { data } = res.data
    console.log(data)
    const model = data.getCarModels.find(
      model => model.Model_Name === 'Model S'
    )
    t.not(model, undefined)
  } catch (error) {
    return console.error(error)
  }
})
