import React from "react";
import { useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";

import { toMoment } from "../utils";

export function GamesSideBar({ show, hide }) {
  const navClass = show ? "nav-sidebar" : "nav-sidebar-hidden";
  const overlayClass = show ? "nav-overlay" : "nav-overlay-hidden";

  return (
    <div className="nav-sidebar-wrapper">
      <label className={overlayClass} onClick={hide}>
        <div className="nav-overlay-cover" />
      </label>
      <nav className={navClass}>{show && <CurrentGames />}</nav>
    </div>
  );
}

function CurrentGames() {
  const { data } = useQuery(CURRENT_GAMES);
  const games = data?.currentGames || [];

  return (
    <div className="leading-loose">
      <div className="nav-sidebar-list">
        <div className="p-8">
          <label className="nav-sidebar-list-label p-8">
            <span className="nav-sidebar-list-txt">Current Games</span>
          </label>
        </div>
        {games.map(game => {
          const { id, homeTeamName, awayTeamName, gameTime } = game;
          const title = `${awayTeamName} @ ${homeTeamName}`;
          const time = toMoment(gameTime).format("MMMM Do, h:mm a");

          return (
            <li key={id} className={`nav-sidebar-list-item my-2 shadow-md`}>
              <label className="nav-sidebar-list-label ml-2">
                <div className="article-title">
                  <div className={`article-title-span font-serif`}>
                    <div className="my-4">{title}</div>
                    <hr />
                    <div className="my-4">{time}</div>
                  </div>
                </div>
              </label>
            </li>
          );
        })}
      </div>
    </div>
  );
}

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
