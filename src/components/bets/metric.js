import React, { useState } from "react";
import { useApolloClient } from "@apollo/react-hooks";

import { GET_SETTINGS } from "../../pages/yourBets";
import { ExitButton } from "../exitButton";

export function Metric({ metric }) {
  const { name } = metric || { name: "?" };
  return (
    <span className="fact-value">
      <div className="underline hover:text-blue-500 cursor-pointer">{name}</div>
    </span>
  );
}

export function MetricSelect({ subject, metric, onSelect }) {
  const apolloClient = useApolloClient();
  let data = { leagueSettings: { playerBets: [] } };
  try {
    data =
      apolloClient &&
      apolloClient.readQuery({
        query: GET_SETTINGS,
        variables: { id: "nfl" }
      });
  } catch {}
  const [search, setSearch] = useState("");
  const [searchIdx, setSearchIdx] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  if (!subject) {
    return null;
  }

  const onChange = e => {
    const value = e.target.value;
    setSearch(value);
  };

  const onKeyDown = e => {
    const lastIdx = metricsChoices.length || 0;
    if (e.keyCode === 27) {
      onSearchExit(); // esc
    } else if (e.keyCode === 13 && metrics.length > 0) {
      selectMetric(metricsChoices[searchIdx]); // enter
    } else if (e.keyCode === 40) {
      const idx = searchIdx === lastIdx - 1 ? 0 : searchIdx + 1;
      setSearchIdx(idx); // down
    } else if (e.keyCode === 38) {
      const idx = searchIdx === 0 ? lastIdx - 1 : searchIdx - 1;
      setSearchIdx(idx); // up
    }
  };

  const selectMetric = metric => () => {
    console.log("seelctmectric", metric);
    onSelect(metric);
    onSearchExit();
  };

  const onSearchExit = () => {
    setSearch("");
    setShowDropdown(false);
  };

  const itemClassName = index =>
    searchIdx === index
      ? "dropdown-list-item bg-gray-200"
      : "dropdown-list-item";

  let metrics = [];
  if (subject.__typename === "Player") {
    metrics = data.leagueSettings.playerBets || [];
  } else if (subject.__typename === "Team") {
    metrics = data.leagueSettings.teamBets || [];
  }
  const metricsChoices = metrics.filter(metric =>
    RegExp(search, "i").test(metric.name)
  );

  return (
    <div className="dropdown-menu flex flex-row">
      <button className="dropdown-btn relative">
        <ExitButton onClick={selectMetric(undefined)} />
        <div className="dropdown-selection">
          <input
            disabled={!!metric.name}
            value={search || metric.name || ""}
            type="text"
            placeholder="Metric"
            className="p-2 mx-5 text-sm"
            onChange={onChange}
            onKeyDown={onKeyDown}
            onFocus={() => setShowDropdown(true)}
          />
        </div>
        {showDropdown && (
          <ul className="dropdown-list">
            {metricsChoices.map((metric, i) => {
              return (
                <div
                  key={metric.name}
                  className={itemClassName(i)}
                  onClick={selectMetric(metric)}
                  onMouseEnter={() => setSearchIdx(i)}
                >
                  <div className="dropdown-list-item-text flex flex-row">
                    {metric.name}
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
