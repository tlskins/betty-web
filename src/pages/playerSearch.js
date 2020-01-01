import React, { useState, useEffect, Fragment } from "react";
import { useLazyQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";

export const SEARCH_PLAYER = gql`
  query searchPlayers($name: String!) {
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

export function PlayerSearch() {
  const [execute, { loading, data, error }] = useLazyQuery(SEARCH_PLAYER);

  console.log(loading, error, data);
  let msg;
  if (loading) msg = "Loading...";
  if (error) return (msg = `Error: ${error.message}`);
  const onChange = e => {
    const name = e.target.value;
    if (name.length == 0) return;
    execute({ variables: { name } });
  };

  return (
    <Fragment>
      <input type="text" onChange={onChange} />
      <p>{msg}</p>
      <Fragment>
        {data &&
          data.findPlayers &&
          data.findPlayers.map(player => (
            <Fragment key={player.id}>
              {player.name} - {player.position} - {player.teamName}
            </Fragment>
          ))}
      </Fragment>
    </Fragment>
  );
}
