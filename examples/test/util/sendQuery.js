const axios = require("axios");

async function sendQuery(query, path, port) {
  return await axios({
    method: "POST",
    url: `http://localhost:${port}${path}`,
    data: {
      query: query
    },
    headers: { "Content-Type": "application/json" }
  });
}

module.exports = sendQuery;
