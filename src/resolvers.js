import gql from "graphql-tag";

export const typeDefs = gql`
  type Player {
    id: ID!
    name: String!
    firstName: String!
    lastName: String!
    fk: String!
    teamFk: String
    teamName: String
    teamShort: String
    position: String
    url: String
  }

  extend type Query {
    findPlayers(name: String, team: String, position: String): [Player]!
  }
`;

export const resolvers = {};
