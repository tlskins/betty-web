import React, { forwardRef, useRef, useImperativeHandle } from "react";

function teamTitle(team, game) {
  let teamName = "";
  if (team) {
    const { name, location } = team;
    teamName = `${name} (${location})`;
  }

  let vsTeam = "";
  if (game && team) {
    const { homeTeamFk, homeTeamName = "N/A", awayTeamName = "N/A" } = game;
    vsTeam = `vs ${homeTeamName}`;
    if (team.fk === homeTeamFk) {
      vsTeam = `vs ${awayTeamName}`;
    }
  }

  return [teamName, vsTeam];
}

export function Team({ team, game }) {
  const [teamName, vsTeam] = teamTitle(team, game);
  return (
    <span className="fact-label">
      <div>
        <div className="underline hover:text-blue-500 cursor-pointer">
          {teamName}
        </div>
        {vsTeam}
      </div>
    </span>
  );
}

export const TeamCard = forwardRef(
  ({ team, searchIdx, setSearchIdx, index, onSelect }, ref) => {
    const { game, ...onlyTeam } = team;
    const { fk } = onlyTeam;

    let vsTeam = "No Game";
    if (game) {
      const { homeTeamFk, homeTeamName, awayTeamName } = game;
      let team = homeTeamName;
      if (homeTeamFk === fk) {
        team = awayTeamName;
      }
      vsTeam = `vs ${team}`;
    }
    const className =
      searchIdx === index
        ? "dropdown-list-item bg-gray-200"
        : "dropdown-list-item";

    const selectGame = () => onSelect({ game, team: onlyTeam });

    const inputRef = useRef();
    useImperativeHandle(ref, () => ({
      onClick: () => selectGame()
    }));

    return (
      <div
        key={fk}
        className={className}
        onClick={selectGame}
        onMouseEnter={() => setSearchIdx(index)}
        ref={inputRef}
      >
        <div className="dropdown-list-item-text flex flex-row">
          <div className="flex flex-col">
            {teamTitle(onlyTeam, game)}
            <br />
            {vsTeam}
          </div>
        </div>
      </div>
    );
  }
);
