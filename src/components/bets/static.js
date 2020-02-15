import React, { useState } from "react";

export function StaticInput({ value, onSelect, disabled }) {
  const onChange = e => {
    let { value } = e.target;
    if (!/[.].*[.]/.test(value)) {
      value = value.replace(/[^0-9.]/, "");
    }
    // setValue(value);
    onSelect(value);
  };

  return (
    <div className="dropdown-menu flex flex-row">
      <button className="dropdown-btn relative">
        <div className="dropdown-selection">
          <input
            value={value}
            disabled={disabled}
            type="text"
            placeholder="Value"
            className="p-2 mx-5 text-xs"
            onChange={onChange}
          />
        </div>
      </button>
    </div>
  );
}
