import React from "react";

export function ExitButton({ onClick }) {
  return (
    <svg
      data-qa="btn-pdp-dismiss-size-list"
      width="15px"
      height="15px"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 30 30"
      className="pointer"
      data-dismiss-on-click="true"
      style={{
        marginTop: `-1px`,
        marginRight: `-1px`,
        stroke: `transparent`,
        verticalAlign: `middle`
      }}
      onClick={onClick}
    >
      <path d="M29,1V29H1V1H29m1-1H0V30H30V0Z"></path>
      <line
        x1="18.08"
        y1="11.92"
        x2="11.92"
        y2="18.08"
        fill="none"
        stroke="black"
        strokeMiterlimit="10"
        strokeWidth="1"
        style={{ stroke: `black` }}
      ></line>
      <line
        x1="18.08"
        y1="18.08"
        x2="11.92"
        y2="11.92"
        fill="none"
        stroke="black"
        strokeMiterlimit="10"
        strokeWidth="1"
        style={{ stroke: `black` }}
      ></line>
    </svg>
  );
}
