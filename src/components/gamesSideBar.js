import React from "react";
import { useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";

import { toMoment } from "../utils";

export function GamesSideBar({ show, hide }) {
  const navClass = show ? "nav-sidebar w-9/12 max-w-2xl" : "nav-sidebar-hidden";
  const overlayClass = show ? "nav-overlay" : "nav-overlay-hidden";

  return (
    <div className="nav-sidebar-wrapper">
      <label className={overlayClass} onClick={hide}>
        <div className="nav-overlay-cover" />
      </label>
      <nav className={navClass}>
        <div className="leading-loose">
          <div className="nav-sidebar-list">
            <div className="p-8">
              <label className="nav-sidebar-list-label p-8">
                <span className="nav-sidebar-list-txt">Current Games</span>
              </label>
            </div>
            {show && <CurrentGames />}
          </div>
        </div>
      </nav>
    </div>
  );
}

export function CurrentGames() {
  const { data } = useQuery(CURRENT_GAMES);
  const games = data?.currentGames || [];
  const gamesByDate = {};
  games.forEach(game => {
    const date = toMoment(game.gameTime).format("MMMM Do");
    if (!gamesByDate[date]) {
      gamesByDate[date] = [];
    }
    gamesByDate[date].push(game);
  });

  return (
    <div className="p-4">
      {Object.entries(gamesByDate).map(([date, games]) => {
        return (
          <li key={date} className={`nav-sidebar-list-item my-2 shadow-md p-4`}>
            <div className="article-title font-extrabold underline tracking-wider">
              {date}
            </div>
            <label className="nav-sidebar-list-label ml-2 flex flex-col">
              {games.map(game => {
                const { id, homeTeamName, awayTeamName, gameTime } = game;
                const title = `${awayTeamName} @ ${homeTeamName}`;
                const time = toMoment(gameTime).format("h:mm a");

                return (
                  <div key={id} className="article-title">
                    <div className="my-4">
                      {title} | {time}
                    </div>
                  </div>
                );
              })}
            </label>
          </li>
        );
      })}
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
