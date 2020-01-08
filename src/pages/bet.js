import React, { useState, useEffect, Fragment } from "react";
import { useLazyQuery, useSubscription } from "@apollo/react-hooks";
import gql from "graphql-tag";
import moment from "moment-timezone";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";

import { useThrottle } from "../utils";
import { apolloClient } from "../index";
import { GET_SETTINGS } from "./yourBets";

export const SEARCH_PLAYER = gql`
  query searchPlayers($name: String!) {
    findPlayers(name: $name, withGame: true) {
      __typename
      id
      firstName
      lastName
      fk
      teamFk
      teamName
      teamShort
      position
      url
      game {
        name
        awayTeamFk
        awayTeamName
        homeTeamFk
        homeTeamName
      }
    }
  }
`;

export function Bet({ bet }) {
  const {
    id,
    finalizedAt,
    equations,
    recipient: { name: rName, screenName: rSN }
  } = bet;
  console.log("bet", bet);

  const finalAt = moment(finalizedAt);

  return (
    <div className="fact-section" key={id}>
      <div className="section-title-wrapper">
        <h1 className="section-title">{`Bet with ${rName}`}</h1>
        <p className="section-subtitle">
          {finalAt.format("MMMM Do YYYY, h:mm:ss a")} | @{rSN}
        </p>
      </div>

      {equations && equations.map(eq => <Equation equation={eq} />)}
    </div>
  );
}

function Equation({ equation, key }) {
  const [edit, setEdit] = useState(null);

  const { leftExpressions, rightExpressions, operator } = equation;
  const op = (operator && operator.name) || "?";

  return (
    <div key={key} className="flex w-full">
      <div className="flex flex-col px-4 py-2 m-2 w-full">
        {leftExpressions &&
          leftExpressions.map((exp, i) => (
            <Expression expression={exp} key={"left" + i} />
          ))}
      </div>
      {edit && edit == "op" && <OperatorSearch onExit={() => setEdit(null)} />}
      {!edit && (
        <div
          className="underline hover:text-blue-500 cursor-pointer px-4 py-2 m-2"
          onClick={() => setEdit("op")}
        >
          {op}
        </div>
      )}
      <div className="flex flex-col px-4 py-2 m-2 w-full">
        {rightExpressions &&
          rightExpressions.map((exp, i) => (
            <Expression expression={exp} key={"right" + i} />
          ))}
      </div>
    </div>
  );
}

function Expression({ expression, key }) {
  const [edit, setEdit] = useState(null);

  const {
    player: { firstName, lastName, position, teamShort, teamFk },
    game: { awayTeamName, homeTeamFk, homeTeamName },
    metric
  } = expression;

  let vsTeam = homeTeamName;
  if (teamFk == homeTeamFk) {
    vsTeam = awayTeamName;
  }

  const metricName = (metric && metric.name) || "?";

  return (
    <div>
      <div className="fact-wrapper" key={key}>
        <span className="fact-label">
          {edit && edit == "metric" && (
            <MetricSearch onExit={() => setEdit(null)} />
          )}
          {edit && edit == "source" && (
            <PlayerSearch onExit={() => setEdit(null)} />
          )}
          {!edit && (
            <div>
              <div
                className="underline hover:text-blue-500 cursor-pointer"
                onClick={() => setEdit("source")}
              >
                {firstName[0]}.{lastName} ({teamShort}-{position})
              </div>
              vs {vsTeam}
            </div>
          )}
        </span>
        <span
          className="fact-value underline hover:text-blue-500 cursor-pointer"
          onClick={() => setEdit("metric")}
        >
          {metricName}
        </span>
      </div>
    </div>
  );
}

function MetricSearch({ onExit }) {
  const data = apolloClient.readQuery({
    query: GET_SETTINGS,
    variables: { id: "nfl" }
  });
  console.log("data", data);

  const [search, setSearch] = useState("");

  const onChange = e => {
    const value = e.target.value;
    setSearch(value);
  };

  const onKeyDown = e => {
    if (e.keyCode === 27) {
      onExit();
    }
  };

  return (
    <div className="dropdown-menu flex flex-row" onMouseLeave={onExit}>
      <button className="dropdown-btn">
        <ExitButton onClick={onExit} />
        <div className="dropdown-title ml-2">Player / Team</div>
        <div className="dropdown-selection">
          <input
            type="text"
            autoFocus={true}
            placeholder="search"
            className="p-2"
            onChange={onChange}
            onKeyDown={onKeyDown}
          />
        </div>
        {data && data.leagueSettings && data.leagueSettings.playerBets && (
          <ul className="dropdown-list">
            {data.leagueSettings.playerBets
              .filter(bet => RegExp(search, "i").test(bet.name))
              .map(bet => {
                const { name } = bet;

                return (
                  <div key={name} className="dropdown-list-item">
                    <div className="dropdown-list-item-text flex flex-row">
                      {name}
                    </div>
                  </div>
                );
              })}
          </ul>
        )}
      </button>
    </div>
  );
}

function OperatorSearch({ onExit }) {
  const data = apolloClient.readQuery({
    query: GET_SETTINGS,
    variables: { id: "nfl" }
  });

  const [search, setSearch] = useState("");

  const onChange = e => {
    const value = e.target.value;
    setSearch(value);
  };

  const onKeyDown = e => {
    if (e.keyCode === 27) {
      onExit();
    }
  };

  return (
    <div className="dropdown-menu flex flex-row" onMouseLeave={onExit}>
      <button className="dropdown-btn">
        <ExitButton onClick={onExit} />
        <div className="dropdown-title ml-2">Equivalency</div>
        <div className="dropdown-selection">
          <input
            type="text"
            autoFocus={true}
            placeholder="search"
            className="p-2"
            onChange={onChange}
            onKeyDown={onKeyDown}
          />
        </div>
        {data && data.leagueSettings && data.leagueSettings.betEquations && (
          <ul className="dropdown-list">
            {data.leagueSettings.betEquations
              .filter(bet => RegExp(search, "i").test(bet.name))
              .map(bet => {
                const { name } = bet;

                return (
                  <div key={name} className="dropdown-list-item">
                    <div className="dropdown-list-item-text flex flex-row">
                      {name}
                    </div>
                  </div>
                );
              })}
          </ul>
        )}
      </button>
    </div>
  );
}

function PlayerSearch({ onExit }) {
  const [execute, { loading, data, error }] = useLazyQuery(SEARCH_PLAYER);
  const search = useThrottle(execute, 300);

  const onChange = e => {
    const name = e.target.value;
    if (name.length == 0) return;
    search({ variables: { name } });
  };

  const onKeyDown = e => {
    if (e.keyCode === 27) {
      onExit();
    }
  };

  return (
    <div className="dropdown-menu flex flex-row" onMouseLeave={onExit}>
      <button className="dropdown-btn">
        <ExitButton onClick={onExit} />
        <div className="dropdown-title ml-2">Player / Team</div>
        <div className="dropdown-selection">
          <input
            type="text"
            autoFocus={true}
            placeholder="search"
            className="p-2"
            onChange={onChange}
            onKeyDown={onKeyDown}
          />
        </div>
        {data && data.findPlayers && (
          <ul className="dropdown-list">
            {data.findPlayers.map(player => {
              const {
                id,
                firstName,
                lastName,
                teamShort,
                position,
                teamFk,
                game
              } = player;

              let vsTeam = "No Game";
              if (game) {
                const { homeTeamFk, homeTeamName, awayTeamName } = game;
                let team = homeTeamName;
                if (homeTeamFk == teamFk) {
                  team = awayTeamName;
                }
                vsTeam = `vs ${team}`;
              }

              return (
                <div key={id} className="dropdown-list-item">
                  <div className="dropdown-list-item-text flex flex-row">
                    <div>
                      <ListItemAvatar>
                        <Avatar
                          alt={firstName + lastName}
                          src={`https://d395i9ljze9h3x.cloudfront.net/req/20180910/images/headshots/${id}_2018.jpg`}
                        />
                      </ListItemAvatar>
                    </div>
                    <div className="flex flex-col">
                      {firstName[0]}.{lastName} ({teamShort}-{position})
                      <br />
                      {vsTeam}
                    </div>
                  </div>
                </div>
              );
            })}
          </ul>
        )}
      </button>
    </div>
  );
}

function ExitButton({ onClick }) {
  return (
    <svg
      data-qa="btn-pdp-dismiss-size-list"
      width="15px"
      height="15px"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 30 30"
      className="pointer"
      data-dismiss-on-click="true"
      style={{
        marginTop: `-1px`,
        marginRight: `-1px`,
        stroke: `transparent`,
        verticalAlign: `middle`
      }}
      onClick={onClick}
    >
      <path d="M29,1V29H1V1H29m1-1H0V30H30V0Z"></path>
      <line
        x1="18.08"
        y1="11.92"
        x2="11.92"
        y2="18.08"
        fill="none"
        stroke="black"
        strokeMiterlimit="10"
        strokeWidth="1"
        style={{ stroke: `black` }}
      ></line>
      <line
        x1="18.08"
        y1="18.08"
        x2="11.92"
        y2="11.92"
        fill="none"
        stroke="black"
        strokeMiterlimit="10"
        strokeWidth="1"
        style={{ stroke: `black` }}
      ></line>
    </svg>
  );
}
