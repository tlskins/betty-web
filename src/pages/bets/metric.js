import React, { useState } from "react";
import { apolloClient } from "../../index";
import { GET_SETTINGS } from "../yourBets";
import { ExitButton } from "../components/exitButton";

export function Metric({ metric, onSelect }) {
  const [edit, setEdit] = useState(false);
  const { name } = metric || { name: "?" };

  const onExit = onSelect && (() => setEdit(false));
  const onClick = onSelect && (() => setEdit(true));

  return (
    <span className="fact-value">
      {edit && <MetricSelect onExit={onExit} onSelect={onSelect} />}
      {!edit && (
        <div
          className="underline hover:text-blue-500 cursor-pointer"
          onClick={onClick}
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
    <div className="dropdown-menu flex flex-row">
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
                console.log("metric", bet);
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
