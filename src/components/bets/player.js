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

export function playerTitle(player, game) {
  let playerName = "";
  if (player) {
    const { firstName, lastName, teamShort, position } = player;
    playerName = `${firstName[0]}.${lastName} (${teamShort}-${position})`;
  }

  let vsTeam = "";
  if (game && player) {
    const { homeTeamFk, homeTeamName = "N/A", awayTeamName = "N/A" } = game;
    vsTeam = `vs ${homeTeamName}`;
    if (player.teamFk === homeTeamFk) {
      vsTeam = `vs ${awayTeamName}`;
    }
  }

  return [playerName, vsTeam];
}

export function Player({ player, game }) {
  const [playerName, vsTeam] = playerTitle(player, game);
  return (
    <span className="fact-label">
      <div>
        <div className="underline hover:text-blue-500 cursor-pointer">
          {playerName}
        </div>
        {vsTeam}
      </div>
    </span>
  );
}

export function PlayerSearch({ playerAndGame, onSelect, onClear }) {
  const [searchPlayer, { data }] = useLazyQuery(SEARCH_PLAYER);
  const [searchIdx, setSearchIdx] = useState(0);
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const throttleSearch = useThrottle(searchPlayer, 300);
  const { player, game } = playerAndGame;
  const players = (data && data.findPlayers) || [];

  const onChange = e => {
    const name = e.target.value;
    setSearch(name);
    throttleSearch({ variables: { name } });
  };

  const onKeyDown = e => {
    if (e.keyCode === 27) {
      onSearchExit(); // esc
    } else if (e.keyCode === 13 && players.length > 0) {
      const { game, ...onlyPlayer } = players[searchIdx];
      onSelect({ game, player: onlyPlayer });
      onSearchExit(); // enter
    } else if (e.keyCode === 40) {
      const idx = searchIdx === players.length - 1 ? 0 : searchIdx + 1;
      setSearchIdx(idx); // down
    } else if (e.keyCode === 38) {
      const idx = searchIdx === 0 ? players.length - 1 : searchIdx - 1;
      setSearchIdx(idx); // up
    }
  };

  const selectPlayer = player => {
    onSelect(player);
    onSearchExit();
  };

  const onSearchExit = () => {
    setSearch("");
    setShowDropdown(false);
  };

  return (
    <div className="dropdown-menu flex flex-row">
      <button className="dropdown-btn relative">
        <ExitButton
          onClick={() => {
            onSearchExit();
            onClear();
          }}
        />
        <div className="dropdown-selection">
          {player && <Player player={player} game={game} />}
          {!player && (
            <input
              value={search}
              type="text"
              placeholder="NFL Player"
              className="p-2 mx-5 text-xs"
              onChange={onChange}
              onKeyDown={onKeyDown}
              onFocus={() => setShowDropdown(true)}
            />
          )}
        </div>
        {showDropdown && (
          <ul className="dropdown-list">
            {players.map((player, i) => (
              <div key={i}>
                <PlayerCard
                  player={player}
                  searchIdx={searchIdx}
                  setSearchIdx={setSearchIdx}
                  index={i}
                  onSelect={selectPlayer}
                />
              </div>
            ))}
          </ul>
        )}
      </button>
    </div>
  );
}

function PlayerCard({ player, searchIdx, setSearchIdx, index, onSelect }) {
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
      onClick={() => onSelect({ game, player: onlyPlayer })}
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
