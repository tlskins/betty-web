import React, { Fragment } from "react";
import { useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";

export const FIND_PLAYERS = gql`
  query findPlayers($name: String!) {
    findPlayers(name: $name) {
      __typename
      id
      name
      fk
      teamFk
      teamName
      teamShort
      position
      url
    }
  }
`;

export default function Players() {
  const { data, loading, error } = useQuery(FIND_PLAYERS, {
    variables: { name: "Haskin" }
  });
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error...{error.message}</p>;

  console.log(data);

  return (
    <Fragment>
      {data.findPlayers &&
        data.findPlayers.map(player => <Fragment>{player.name}</Fragment>)}
    </Fragment>
  );
}
