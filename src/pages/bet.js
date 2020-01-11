import React, { useState } from "react";
import { useLazyQuery, useSubscription } from "@apollo/react-hooks";
import gql from "graphql-tag";
import moment from "moment-timezone";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";
// import { useApolloClient } from "@apollo/client";

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
        fk
        name
        awayTeamFk
        awayTeamName
        homeTeamFk
        homeTeamName
      }
    }
  }
`;

// const Mutation = gql`
//   mutation updateBet($id: String!, $changes: BetChanges!) {
//     updateBet(text: $text, roomName: $channel, username: $name) {
//       id
//     }
//   }
// `;

export function Bet({ bet = {} }) {
  const { id, finalizedAt, equations = [], recipient = {} } = bet;
  const { name = "?", screenName = "?" } = recipient;
  const [editEquations, setEditEquations] = useState(
    equations.map(e => {
      return { id: e.id, edited: false };
    })
  );
  const editedEquations = equations.map((e, i) => {
    return { ...e, ...editEquations[i] };
  });
  console.log(equations, editEquations, editedEquations);

  const changeEquation = eqChg => {
    console.log("eqchg", eqChg);
    const idx = editEquations.findIndex(eq => eq == eqChg.id);
    setEditEquations([
      ...editEquations.slice(0, idx),
      { ...editEquations[idx], ...eqChg },
      ...editEquations.slice(idx + 1)
    ]);
  };

  const finalAt = moment(finalizedAt, "YYYY-MM-DD HH:mm:ss Z");

  return (
    <div className="fact-section">
      <div className="section-title-wrapper">
        <h1 className="section-title">{`Bet with ${name}`}</h1>
        <p className="section-subtitle">
          {finalAt.format("MMMM Do YYYY, h:mm:ss a")} | @{screenName}
        </p>
      </div>
      {editedEquations &&
        editedEquations.map((eq, i) => (
          <div key={i}>
            <Equation equation={eq} onChange={changeEquation} />
          </div>
        ))}
    </div>
  );
}

function Equation({ key, equation = {}, onChange }) {
  const {
    leftExpressions = [],
    rightExpressions = [],
    operator = {}
  } = equation;

  return (
    <div key={key} className="flex w-full">
      <div className="flex flex-col px-4 py-2 m-2 w-full">
        {leftExpressions.map((exp, i) => (
          <div key={i}>
            <Expression
              expression={exp}
              onChange={exprChg =>
                onChange({ id: equation.id, expression: exprChg.id })
              }
            />
          </div>
        ))}
      </div>
      <Operator
        operator={operator}
        onSelect={operator => onChange({ operator })}
      />
      <div className="flex flex-col px-4 py-2 m-2 w-full">
        {rightExpressions.map((exp, i) => (
          <div key={i}>
            <Expression
              expression={exp}
              onChange={exprChg =>
                onChange({ id: equation.id, expression: exprChg.id })
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function Expression({ eqIdx, exprIdx, expression, dispatch }) {
  const { id, player, game, metric } = expression;

  return (
    <div>
      <div className="fact-wrapper">
        <Source
          player={player}
          game={game}
          onSelect={source =>
            dispatch({ type: "addSource", source, eqIdx, exprIdx })
          }
        />
        <Metric
          metric={metric}
          onSelect={metric =>
            dispatch({ type: "addMetric", metric, eqIdx, exprIdx })
          }
        />
      </div>
    </div>
  );
}

export function Operator({ operator, onSelect }) {
  const [edit, setEdit] = useState(false);
  const { name = "?" } = operator || {};

  return (
    <div>
      {edit && (
        <OperatorSearch onExit={() => setEdit(false)} onSelect={onSelect} />
      )}
      {!edit && (
        <div
          className="underline hover:text-blue-500 cursor-pointer px-4 py-2 m-2"
          onClick={() => setEdit(true)}
        >
          {name}
        </div>
      )}
    </div>
  );
}

function OperatorSearch({ onExit, onSelect }) {
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
                  <div
                    key={name}
                    className="dropdown-list-item"
                    onClick={() => {
                      onSelect(bet);
                      onExit();
                    }}
                  >
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

export function Metric({ metric, onSelect }) {
  const [edit, setEdit] = useState(false);
  const { name } = metric || { name: "?" };

  return (
    <span className="fact-value">
      {edit && (
        <MetricSelect onExit={() => setEdit(false)} onSelect={onSelect} />
      )}
      {!edit && (
        <div
          className="underline hover:text-blue-500 cursor-pointer"
          onClick={() => setEdit(true)}
        >
          {name}
        </div>
      )}
    </span>
  );
}

function MetricSelect({ onExit, onSelect }) {
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
        <div className="dropdown-title ml-2">Metric</div>
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
                  <div
                    key={name}
                    className="dropdown-list-item"
                    onClick={() => {
                      onSelect(bet);
                      onExit();
                    }}
                  >
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

export function Source({ player, game, onSelect }) {
  const [edit, setEdit] = useState(false);

  let playerName = "Add Player";
  if (player) {
    const { firstName, lastName, teamShort, position } = player;
    playerName = `${firstName[0]}.${lastName} (${teamShort}-${position})`;
  }

  let vsTeam = "";
  if (game && player) {
    const { awayTeamName, homeTeamFk, homeTeamName } = game;
    vsTeam = `vs ${homeTeamName}`;
    if (player.teamFk == homeTeamFk) {
      vsTeam = `vs ${awayTeamName}`;
    }
  }

  return (
    <span className="fact-label">
      {edit && (
        <PlayerSearch
          onExit={() => setEdit(false)}
          onSelect={source => onSelect(source)}
        />
      )}
      {!edit && (
        <div>
          <div
            className="underline hover:text-blue-500 cursor-pointer"
            onClick={() => setEdit(true)}
          >
            {playerName}
          </div>
          {vsTeam}
        </div>
      )}
    </span>
  );
}

function PlayerSearch({ onExit, onSelect }) {
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
              const { game, ...onlyPlayer } = player;
              const {
                id,
                firstName,
                lastName,
                teamShort,
                position,
                teamFk
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
                <div
                  key={id}
                  className="dropdown-list-item"
                  onClick={() => {
                    onSelect({ game, player: onlyPlayer });
                    onExit();
                  }}
                >
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
