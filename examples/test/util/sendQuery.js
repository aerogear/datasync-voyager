const axios = require('axios')

function sendQuery (query, path, port) {
  return axios({
    method: 'POST',
    url: `http://localhost:${port}${path}`,
    data: {
      query: query
    },
    headers: { 'Content-Type': 'application/json' }
  })
}

module.exports = sendQuery
