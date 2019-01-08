const test = require('ava')
const axios = require('axios')

const localKeycloak = require('./util/configureKeycloak')
const { app, server } = require('../keycloak/server')
const getAuthToken = require('./util/getAuthToken')

process.env.KEYCLOAK_CONFIG_FILE = require('path').resolve(__dirname, './config/keycloak.json')
const keycloakConfig = require(process.env.KEYCLOAK_CONFIG_FILE)

const TEST_PASSWORD = 'admin'

// Run Keycloak Example Application
const port = 4000
app.listen({ port })

// Used in CI
function modifyKeycloakServerUrl (url) {
  const fs = require('fs')
  keycloakConfig['auth-server-url'] = url
  fs.writeFileSync(process.env.KEYCLOAK_CONFIG_FILE, JSON.stringify(keycloakConfig))
}

async function sendQuery(token) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) {
    headers['Authorization'] = token
  }
  return await axios({
      method: 'POST',
      url: `http://localhost:${port}${server.graphqlPath}`,
      data: {
          "query":"{ hello }"
      },
      headers,
      maxRedirects: 0
  })
}

test.before(async () => {
  // Used in Circle CI
  if (process.env.KEYCLOAK_HOST && process.env.KEYCLOAK_PORT) {
    modifyKeycloakServerUrl(`http://${process.env.KEYCLOAK_HOST}:${process.env.KEYCLOAK_PORT}/auth`)
  }
  await localKeycloak.prepareKeycloak(keycloakConfig['auth-server-url'], TEST_PASSWORD)
})

test.after.always(async () => {
  await localKeycloak.resetKeycloakConfiguration()
})

test('Unauthenticated request (with invalid token) should fail', async t => {
  try {
    const res = await sendQuery()
    t.fail('unauthenticated request passed')
  } catch (e) {
    t.deepEqual(e.response.status, 302, 'Improper HTTP redirection to Keycloak')
  }
})

test('Authenticated request with client-role and realm role admin user should work', async t => {
    const authToken = await getAuthToken(keycloakConfig, 'client-role-realm-admin', TEST_PASSWORD)
    try {
      const res = await sendQuery(authToken)
      t.deepEqual(res.status, 200)
      t.deepEqual(res.data.errors, undefined)
    } catch (error) {
      return console.error(error)
    }
})

test('Authenticated request with client-role admin user should work', async t => {
  const authToken = await getAuthToken(keycloakConfig, 'client-role-admin', TEST_PASSWORD)
  try {
    const res = await sendQuery(authToken)
    t.deepEqual(res.status, 200)
    t.deepEqual(res.data.errors, undefined)
  } catch (error) {
    return console.error(error)
  }
})

test('Authenticated request with only admin realm-role user should not work', async t => {
  const authToken = await getAuthToken(keycloakConfig, 'realm-admin', TEST_PASSWORD)
  try {
    const res = await sendQuery(authToken)
    t.deepEqual(res.status, 200)
    t.true(res.data.errors !== undefined)
  } catch (error) {
    return console.error(error)
  }
})

test('Authenticated request with user without admin role should not work', async t => {
  const authToken = await getAuthToken(keycloakConfig, 'user-without-role', TEST_PASSWORD)
  try {
    const res = await sendQuery(authToken)
    t.deepEqual(res.status, 200)
    t.true(res.data.errors !== undefined)
  } catch (error) {
    return console.error(error)
  }
})