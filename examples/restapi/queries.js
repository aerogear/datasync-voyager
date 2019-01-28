const queries = `query getCharacterInfo {
  getCharacterInfo(id:11) {
    name 
    homeworld
    gender
  }  
}
`;

module.exports = queries;
