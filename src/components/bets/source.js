import React, { useState } from "react";
import { useLazyQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";
import { useThrottle } from "../../utils";
import { ExitButton } from "../exitButton";

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
    if (player.teamFk === homeTeamFk) {
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
  const [execute, { data }] = useLazyQuery(SEARCH_PLAYER);
  const [searchIdx, setSearchIdx] = useState(0);
  const search = useThrottle(execute, 300);

  const onChange = e => {
    const name = e.target.value;
    if (name.length === 0) return;
    search({ variables: { name } });
  };

  const onKeyDown = e => {
    if (e.keyCode === 27) {
      // esc
      onExit();
    } else if (
      e.keyCode === 13 &&
      data &&
      data.findPlayers &&
      data.findPlayers.length > 0
    ) {
      // enter
      onSelect({ user: data.findPlayers[searchIdx] });
      onExit();
    } else if (e.keyCode === 40) {
      // down
      const idx = searchIdx === data.findPlayers.length - 1 ? 0 : searchIdx + 1;
      setSearchIdx(idx);
    } else if (e.keyCode === 38) {
      // up
      const idx = searchIdx === 0 ? data.findPlayers.length - 1 : searchIdx - 1;
      setSearchIdx(idx);
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
            className="p-2 mx-5"
            onChange={onChange}
            onKeyDown={onKeyDown}
          />
        </div>
        {data && data.findPlayers && (
          <ul className="dropdown-list">
            {data.findPlayers.map((player, i) => (
              <div key={i}>
                <Player
                  player={player}
                  searchIdx={searchIdx}
                  setSearchIdx={setSearchIdx}
                  index={i}
                  onSelect={onSelect}
                  onExit={onExit}
                />
              </div>
            ))}
          </ul>
        )}
      </button>
    </div>
  );
}

function Player({ player, searchIdx, setSearchIdx, index, onSelect, onExit }) {
  const { game, ...onlyPlayer } = player;
  const { id, firstName, lastName, teamShort, position, teamFk } = player;

  let vsTeam = "No Game";
  if (game) {
    const { homeTeamFk, homeTeamName, awayTeamName } = game;
    let team = homeTeamName;
    if (homeTeamFk === teamFk) {
      team = awayTeamName;
    }
    vsTeam = `vs ${team}`;
  }
  const className =
    searchIdx === index
      ? "dropdown-list-item bg-gray-200"
      : "dropdown-list-item";

  return (
    <div
      key={id}
      className={className}
      onClick={() => {
        onSelect({ game, player: onlyPlayer });
        onExit();
      }}
      onMouseEnter={() => setSearchIdx(index)}
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
}
