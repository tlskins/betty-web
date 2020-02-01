import React, { forwardRef, useRef, useImperativeHandle } from "react";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";

export function Player({ player, game }) {
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

export const PlayerCard = forwardRef(
  ({ player, searchIdx, setSearchIdx, index, onSelect }, ref) => {
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

    const selectPlayer = () => onSelect({ game, player: onlyPlayer });

    const inputRef = useRef();
    useImperativeHandle(ref, () => ({
      onClick: () => selectPlayer()
    }));

    return (
      <div
        key={id}
        className={className}
        onClick={selectPlayer}
        onMouseEnter={() => setSearchIdx(index)}
        ref={inputRef}
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
);
