import React, { useState } from "react";
import { useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { Carousel } from "./components/carousel";

export const CURRENT_GAMES = gql`
  query currentGames {
    currentGames {
        __typename
        id
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
    const { loading, error, data } = useQuery(CURRENT_GAMES);
    console.log("current games", loading, error, data);
  
    return (
        <div className="fact-section">
            <div className="section-title-wrapper">
                <h1 className="section-title mb-10">
                    Current Games
                </h1>
                <Carousel items={data && data.currentGames}/>
            </div>
        </div>
    )
}