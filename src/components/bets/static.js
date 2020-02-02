import React, { useState } from "react";
import { ExitButton } from "../exitButton";

export function StaticInput({ value, onSelect, onClear, disabled }) {
  const [stateValue, setValue] = useState(0);

  const onChange = e => {
    let { value } = e.target;
    if (!/[.].*[.]/.test(value)) {
      value = value.replace(/[^0-9.]/, "");
    }
    setValue(value);
  };

  const onKeyDown = e => {
    if (e.keyCode === 13) {
      onSelect(value);
    }
  };

  return (
    <div className="dropdown-menu flex flex-row">
      <button className="dropdown-btn relative">
        {!disabled && <ExitButton onClick={onClear} />}
        <div className="dropdown-selection">
          <input
            value={value || stateValue}
            disabled={disabled}
            type="text"
            placeholder="Value"
            className="p-2 mx-5 text-xs"
            onChange={onChange}
            onKeyDown={onKeyDown}
          />
        </div>
      </button>
    </div>
  );
}
