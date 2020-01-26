import React, { useState } from "react";
import { useApolloClient } from "@apollo/react-hooks";

import { GET_SETTINGS } from "../../pages/yourBets";
import { ExitButton } from "../exitButton";

export function Operator({ operator, onSelect }) {
  const [edit, setEdit] = useState(false);
  const { name = "?" } = operator || {};

  const onExit = onSelect && (() => setEdit(false));
  const onClick = onSelect && (() => setEdit(true));

  return (
    <div>
      {edit && <OperatorSearch onExit={onExit} onSelect={onSelect} />}
      {!edit && (
        <div
          className="underline hover:text-blue-500 cursor-pointer px-4 py-2 m-2"
          onClick={onClick}
        >
          {name}
        </div>
      )}
    </div>
  );
}

function OperatorSearch({ onExit, onSelect }) {
  const apolloClient = useApolloClient();
  const data = apolloClient.readQuery({
    query: GET_SETTINGS,
    variables: { id: "nfl" }
  });
  const [search, setSearch] = useState("");
  const [searchIdx, setSearchIdx] = useState(0);

  const onChange = e => {
    const value = e.target.value;
    setSearch(value);
  };

  const onKeyDown = e => {
    const lastIdx = data.leagueSettings.betEquations.length || 0;
    if (e.keyCode === 27) {
      // esc
      onExit();
    } else if (
      e.keyCode === 13 &&
      data.leagueSettings.betEquations.length > 0
    ) {
      // enter
      onSelect(data.leagueSettings.betEquations[searchIdx]);
      onExit();
    } else if (e.keyCode === 40) {
      // down
      const idx = searchIdx === lastIdx - 1 ? 0 : searchIdx + 1;
      setSearchIdx(idx);
    } else if (e.keyCode === 38) {
      // up
      const idx = searchIdx === 0 ? lastIdx - 1 : searchIdx - 1;
      setSearchIdx(idx);
    }
  };

  return (
    <div className="dropdown-menu flex flex-row">
      <div className="dropdown-btn flex-row">
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
              .map((bet, i) => {
                const { name } = bet;
                const className =
                  searchIdx === i
                    ? "dropdown-list-item bg-gray-200"
                    : "dropdown-list-item";
                return (
                  <div
                    key={name}
                    className={className}
                    onClick={() => {
                      onSelect(bet);
                      onExit();
                    }}
                    onMouseEnter={() => setSearchIdx(i)}
                  >
                    <div className="dropdown-list-item-text flex flex-row">
                      {name}
                    </div>
                  </div>
                );
              })}
          </ul>
        )}
      </div>
    </div>
  );
}
