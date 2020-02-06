import React, { useState } from "react";
import { useApolloClient, useQuery } from "@apollo/react-hooks";

import { GET_BET_MAPS } from "../../components/bets/metric";
import { ExitButton } from "../exitButton";

export function Operator({ operator }) {
  return (
    <div>
      <div className="underline hover:text-blue-500 cursor-pointer px-4 py-2 m-2">
        {(operator && operator.name) || "?"}
      </div>
    </div>
  );
}

export function OperatorSearch({ operator, onSelect, onClear }) {
  const { data } = useQuery(GET_BET_MAPS, {
    variables: { betType: "Operator" }
  });
  const [search, setSearch] = useState("");
  const [searchIdx, setSearchIdx] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const { name } = operator;
  const operators = data?.getBetMaps || [];
  const opChoices = operators.filter(operator =>
    RegExp(search, "i").test(operator.name)
  );

  const onChange = e => {
    const value = e.target.value;
    setSearch(value);
  };

  const onKeyDown = e => {
    const lastIdx = opChoices.length || 0;
    if (e.keyCode === 27) {
      onSearchExit(); // esc
    } else if (e.keyCode === 13 && opChoices.length > 0) {
      onSelect(opChoices[searchIdx]);
      onSearchExit(); // enter
    } else if (e.keyCode === 40) {
      const idx = searchIdx === lastIdx - 1 ? 0 : searchIdx + 1;
      setSearchIdx(idx); // down
    } else if (e.keyCode === 38) {
      const idx = searchIdx === 0 ? lastIdx - 1 : searchIdx - 1;
      setSearchIdx(idx); // up
    }
  };

  const selectOperator = operator => () => {
    onSelect(operator);
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

  return (
    <div className="dropdown-menu flex flex-row">
      <div className="dropdown-btn flex-row relative">
        <ExitButton
          onClick={() => {
            onSearchExit();
            onClear();
          }}
        />
        <div className="dropdown-selection flex flex-col">
          <input
            disabled={!!name}
            value={search || name || ""}
            type="text"
            placeholder="Compare"
            className="p-2 text-sm"
            onChange={onChange}
            onKeyDown={onKeyDown}
            onFocus={() => setShowDropdown(true)}
          />
          {showDropdown && (
            <ul className="dropdown-list">
              {opChoices.map((operator, i) => {
                return (
                  <div
                    key={operator.name}
                    className={itemClassName(i)}
                    onClick={selectOperator(operator)}
                    onMouseEnter={() => setSearchIdx(i)}
                  >
                    <div className="dropdown-list-item-text flex flex-row">
                      {operator.name}
                    </div>
                  </div>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
