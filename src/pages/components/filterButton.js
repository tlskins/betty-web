import React from "react";

export function FilterButton({ onClick }) {
  return (
    <label className="collapse-toggle">
      <span className="toggle-name">SHOW FILTERS</span>
      <svg
        data-name="Layer 1"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 8.33 5"
        width="10px"
        height="10px"
        className="arrow pointer "
        style={{ transform: `rotate(-270deg)` }}
      >
        <polyline
          points="1.17 4.25 4.17 1.25 7.17 4.25"
          fill="none"
          stroke="#0b0b0b"
          strokeMiterlimit="10"
          strokeWidth="1.5"
        ></polyline>
      </svg>
    </label>
  );
}
