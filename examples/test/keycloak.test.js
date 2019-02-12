const test = require('ava')
const axios = require('axios')

const localKeycloak = require('./util/configureKeycloak')

const getAuthToken = require('./util/getAuthToken')

process.env.KEYCLOAK_CONFIG_FILE = require('path').resolve(__dirname, '../keycloak/config/keycloak.json')
const keycloakConfig = require(process.env.KEYCLOAK_CONFIG_FILE)

const exampleAppPort = 4000
let exampleAppGraphqlPath

const TEST_PASSWORD = 'admin'

// Used in CI
function modifyKeycloakServerUrl (url) {
  const fs = require('fs')
  keycloakConfig['auth-server-url'] = url
  fs.writeFileSync(process.env.KEYCLOAK_CONFIG_FILE, JSON.stringify(keycloakConfig))
}

function sendQuery (token, maxRedirects) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) {
    headers['Authorization'] = token
  }
  return axios({
    method: 'POST',
    url: `http://localhost:${exampleAppPort}${exampleAppGraphqlPath}`,
    data: {
      'query': '{ hello }'
    },
    headers,
    maxRedirects
  })
}

test.before(async () => {
  // Used in Circle CI
  if (process.env.KEYCLOAK_HOST && process.env.KEYCLOAK_PORT) {
    modifyKeycloakServerUrl(`http://${process.env.KEYCLOAK_HOST}:${process.env.KEYCLOAK_PORT}/auth`)
  }
  // Run Keycloak Example Application
  const { app, server } = require('../keycloak/server')
  app.listen({ port: exampleAppPort })
  exampleAppGraphqlPath = server.graphqlPath

  // Configure Keycloak (users, roles)
  await localKeycloak.prepareKeycloak(keycloakConfig['auth-server-url'], TEST_PASSWORD)
})

test.after.always(async () => {
  await localKeycloak.resetKeycloakConfiguration()
})

test('Unauthenticated request (with invalid token) should fail', async t => {
  try {
    await sendQuery(undefined, 0)
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
