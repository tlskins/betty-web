import React, { useState } from "react";
import { useQuery, useLazyQuery } from "@apollo/react-hooks";
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
  const [findTeamRoster, { data: rosterData }] = useLazyQuery(FIND_TEAM_ROSTER);
  const [showRoster, setShowRoster] = useState(false);
  const games = data?.currentGames || [];
  const gamesByDate = {};
  games.forEach(game => {
    const date = toMoment(game.gameTime).format("MMMM Do");
    if (!gamesByDate[date]) {
      gamesByDate[date] = [];
    }
    gamesByDate[date].push(game);
  });

  const onClickTeam = (teamFk, leagueId, gameId) => () => {
    if (showRoster) {
      setShowRoster(false);
    } else {
      setShowRoster(gameId);
    }
    findTeamRoster({
      variables: { leagueId, teamFk }
    });
  };

  let roster = rosterData?.findTeamRoster || [];
  roster = roster.sort((a, b) => {
    if (a.position < b.position) {
      return -1;
    }
    if (a.position > b.position) {
      return 1;
    }
    return 0;
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
                const {
                  id,
                  leagueId,
                  homeTeamName,
                  homeTeamFk,
                  awayTeamName,
                  awayTeamFk,
                  gameTime
                } = game;
                const time = toMoment(gameTime).format("h:mm a");
                return (
                  <div key={id} className="article-title">
                    <div className="my-2">
                      <span
                        className="text-teal-700 underline hover:text-blue cursor-pointer"
                        onClick={onClickTeam(awayTeamFk, leagueId, id)}
                      >
                        {awayTeamName}
                      </span>{" "}
                      @{" "}
                      <span
                        className="text-teal-700 underline hover:text-blue cursor-pointer"
                        onClick={onClickTeam(homeTeamFk, leagueId, id)}
                      >
                        {homeTeamName}
                      </span>{" "}
                      | {time}
                    </div>
                    {showRoster === id && (
                      <div className="rounded border-2 border-teal-700 p-2 my-4 text-center">
                        <table className="table-auto">
                          <tr>
                            <th className="lg:px-4">Name</th>
                            <th className="lg:px-4">POS</th>
                            <th className="lg:px-4">Stats</th>
                          </tr>
                          {roster.map(player => {
                            const { name, position, url } = player;
                            return (
                              <tr className="hover:bg-gray-200">
                                <td className="lg:px-4">{name}</td>
                                <td className="lg:px-4 bg-teal-200">
                                  {position}
                                </td>
                                <td className="lg:px-4">
                                  <a
                                    href={url}
                                    target="_blank"
                                    className="underline"
                                  >
                                    stats
                                  </a>
                                </td>
                              </tr>
                            );
                          })}
                        </table>
                      </div>
                    )}
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

export const FIND_TEAM_ROSTER = gql`
  query findTeamRoster($leagueId: String!, $teamFk: String!) {
    findTeamRoster(leagueId: $leagueId, teamFk: $teamFk) {
      id
      leagueId
      name
      url
      position
    }
  }
`;
