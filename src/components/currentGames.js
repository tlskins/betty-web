import React from "react";
import { useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { GamesCarousel } from "./carousel";

export const CURRENT_GAMES = gql`
  query currentGames {
    currentGames {
      id
      leagueId
      fk
      name
      awayTeamFk
      awayTeamName
      homeTeamFk
      homeTeamName
      gameTime
      gameResultsAt
      url
    }
  }
`;

export function CurrentGames() {
  const { data } = useQuery(CURRENT_GAMES);
  const games = data?.currentGames || [];

  return (
    <div className="fact-section">
      <div className="section-title-wrapper">
        <GamesCarousel games={games} />
      </div>
    </div>
  );
}
