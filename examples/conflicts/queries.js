const queries =
`mutation changeHello {
  changeHello(to: "GraphQL developer", version: 1){
    to
    version
  }
}

query hello {
  hello
}`

module.exports = queries

