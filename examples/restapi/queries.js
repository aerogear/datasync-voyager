const queries = `query getCarModels {
  getCarModels(brand:"toyota") {
    Model_ID
    Make_Name
    Model_Name
  }
}
`

module.exports = queries
