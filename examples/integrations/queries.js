const queries = `query getCharacterInfo {
  getCharacterInfo(id:11) {
    name 
    surname
    height
    gender
    genderFromName {
      firstName
      lastName
      scale
      gender
    }
  }  
}

query getGenderFromName {
  getGenderFromName(name:"Jenny",surname:"Suk") {
    firstName
    lastName
    gender
    scale
  }
}



`;

module.exports = queries;
