const { gql } = require('apollo-server');

// define the datatypes in the db
// Map contains name of valorant map and url of the image
// Project contains the author of the saved canvas and the saved canvas string
const typeDefs = gql`
  type Map {
    name: String
    url: String
  }

  type Project {
    cid: Int
    author: String
    canvas: String
  }

  type Account {
    username: String
    password: String
  }

  type Mutation{
    saveProject(cid: Int, author: String, canvas: String): Project
    updateProject(cid: Int, canvas: String): Project
    addAccount(username: String, password: String): Account
  }

  type Query {
    maps: [Map]
    map(name: String): Map
    projects: [Project]
    project(cid: Int): Project
    account(username: String): Account
    accounts: [Account]
  }
`;
module.exports = typeDefs;