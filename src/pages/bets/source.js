import React, { useState } from "react";
import { useLazyQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";
import { useThrottle } from "../../utils";
import { ExitButton } from "../components/exitButton";

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

export function Source({ player, game, onSelect }) {
  const [edit, setEdit] = useState(false);

  let playerName = "?";
  if (player) {
    const { firstName, lastName, teamShort, position } = player;
    playerName = `${firstName[0]}.${lastName} (${teamShort}-${position})`;
  } else if (player && onSelect) {
    playerName = "Add Player";
  }

  let vsTeam = "";
  if (game && player) {
    const { homeTeamFk, homeTeamName = "N/A", awayTeamName = "N/A" } = game;
    vsTeam = `vs ${homeTeamName}`;
    if (player.teamFk == homeTeamFk) {
      vsTeam = `vs ${awayTeamName}`;
    }
  }

  const onExit = onSelect && (() => setEdit(false));
  const onSelectPlayer = onSelect && (source => onSelect(source));
  const onClick = onSelect && (() => setEdit(true));

  return (
    <span className="fact-label">
      {edit && <PlayerSearch onExit={onExit} onSelect={onSelectPlayer} />}
      {!edit && (
        <div>
          <div
            className="underline hover:text-blue-500 cursor-pointer"
            onClick={onClick}
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
    <div className="dropdown-menu flex flex-row">
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
