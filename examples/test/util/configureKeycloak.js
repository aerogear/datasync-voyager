const axios = require('axios')
const realmToImport = require('../../keycloak/config/realm-export.json')

const config = {
  appRealmName: 'voyager-testing',
  adminRealmName: 'master',
  resource: 'admin-cli',
  username: 'admin',
  password: 'admin',
  token: null,
  authServerUrl: null
}

const usersConfiguration = [
  { name: 'client-role-realm-admin', realmRole: 'admin', clientId: 'voyager-testing', clientRoleName: 'admin' },
  { name: 'client-role-admin', clientId: 'voyager-testing', clientRoleName: 'admin' },
  { name: 'realm-admin', realmRole: 'admin', clientId: 'voyager-testing' },
  { name: 'user-without-role' }
]

async function authenticateKeycloak () {
  const res = await axios({
    method: 'POST',
    url: `${config.authServerUrl}/realms/${config.adminRealmName}/protocol/openid-connect/token`,
    data: `client_id=${config.resource}&username=${config.username}&password=${config.password}&grant_type=password`
  }).catch((err) => { return console.error(err) })
  return `Bearer ${res.data['access_token']}`
}

async function importRealm () {
  await axios({
    method: 'POST',
    url: `${config.authServerUrl}/admin/realms`,
    data: realmToImport,
    headers: { 'Authorization': config.token, 'Content-Type': 'application/json' }
  }).catch((err) => { return console.error(err) })
}

async function getRealmRoles () {
  const res = await axios({
    method: 'GET',
    url: `${config.authServerUrl}/admin/realms/${config.appRealmName}/roles`,
    headers: { 'Authorization': config.token }
  }).catch((err) => { return console.error(err) })

  return res.data
}

async function getClients () {
  const res = await axios({
    method: 'GET',
    url: `${config.authServerUrl}/admin/realms/${config.appRealmName}/clients`,
    headers: { 'Authorization': config.token }
  }).catch((err) => { return console.error(err) })

  return res.data
}

async function getClientRoles (client) {
  const res = await axios({
    method: 'GET',
    url: `${config.authServerUrl}/admin/realms/${config.appRealmName}/clients/${client.id}/roles`,
    headers: { 'Authorization': config.token }
  }).catch((err) => { return console.error(err) })
  return res.data
}

async function createUser (name, password) {
  const res = await axios({
    method: 'post',
    url: `${config.authServerUrl}/admin/realms/${config.appRealmName}/users`,
    data: {
      'username': name,
      'credentials': [{ 'type': 'password', 'value': password, 'temporary': false }],
      'enabled': true
    },
    headers: { 'Authorization': config.token, 'Content-Type': 'application/json' }
  })
  if (res) {
    return res.headers.location
  }
}

async function assignRealmRoleToUser (userIdUrl, role) {
  const res = await axios({
    method: 'POST',
    url: `${userIdUrl}/role-mappings/realm`,
    data: [role],
    headers: { 'Authorization': config.token, 'Content-Type': 'application/json' }
  }).catch((err) => { return console.error(err) })

  return res.data
}

async function assignClientRoleToUser (userIdUrl, client, role) {
  const res = await axios({
    method: 'POST',
    url: `${userIdUrl}/role-mappings/clients/${client.id}`,
    data: [role],
    headers: { 'Authorization': config.token, 'Content-Type': 'application/json' }
  }).catch((err) => { return console.error(err) })
  return res.data
}

async function prepareKeycloak (authServerUrl, testPassword) {
  config.authServerUrl = authServerUrl
  config.token = await authenticateKeycloak()
  await importRealm()
  const realmRoles = await getRealmRoles()
  const clients = await getClients()

  for (let user of usersConfiguration) {
    // Create a new user
    const userIdUrl = await createUser(user.name, testPassword)
    // Assign realm role to user
    if (user.realmRole) {
      const selectedRealmRole = realmRoles.find(role => role.name === user.realmRole)
      await assignRealmRoleToUser(userIdUrl, selectedRealmRole)
    }
    // Assign client role to user
    if (user.clientId && user.clientRoleName) {
      const selectedClient = clients.find(client => client.clientId === user.clientId)
      const clientRoles = await getClientRoles(selectedClient)
      const selectedClientRole = clientRoles.find(clientRole => clientRole.name === user.clientRoleName)
      await assignClientRoleToUser(userIdUrl, selectedClient, selectedClientRole)
    }
  }
}

async function resetKeycloakConfiguration () {
  await axios({
    method: 'DELETE',
    url: `${config.authServerUrl}/admin/realms/${config.appRealmName}`,
    headers: { 'Authorization': config.token }
  }).catch((err) => { return console.error(err) })
}

module.exports = {
  prepareKeycloak,
  resetKeycloakConfiguration
}
