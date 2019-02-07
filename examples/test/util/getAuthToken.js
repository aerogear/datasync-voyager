const axios = require('axios')

async function getAuthToken (keycloakConfig, username, password) {
  const res = await axios({
    method: 'post',
    url: `${keycloakConfig['auth-server-url']}/realms/${keycloakConfig.realm}/protocol/openid-connect/token`,
    data: `client_id=${keycloakConfig.resource}&username=${username}&password=${password}&grant_type=password`
  })
  return `Bearer ${res.data['access_token']}`
}

module.exports = getAuthToken
