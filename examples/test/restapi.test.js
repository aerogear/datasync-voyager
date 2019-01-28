const test = require("ava");
const { server, app } = require("../integrations/server");
const port = 4000;
app.listen({ port });
const sendQuery = query =>
  require("./util/sendQuery")(query, server.graphqlPath, port);

const query = `
query getCharacterInfo {
  getCharacterInfo(id:11) {
    name
    homeworld
    gender
  }
}
`;

test("Sending a query for Anakin Skywalker", async t => {
  try {
    const res = await sendQuery(query);
    t.deepEqual(res.status, 200);
    t.deepEqual(res.data.errors, undefined);
    const { data } = res.data;
    t.deepEqual(data.getCharacterInfo.name, "Anakin Skywalker");
    t.deepEqual(data.getCharacterInfo.gender, "male");
  } catch (error) {
    return console.error(error);
  }
});
