const queries =
`mutation changeHello {
  changeHello(to: "Me!", version: 1){
    to
    version
  }
}

query hello {
  hello
}`

module.exports = queries

