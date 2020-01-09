import React from "react";
import "./styles.css";

export function NavBar({ clickRotoNfl }) {
  return (
    <nav className="nav-bar">
      <div className="nav-hdr-content">
        <div className="nav-menu-container">
          <div>
            <label className="nav_hamburger">
              <span className="hamburger_slice" />
              <span className="hamburger_slice" />
              <span className="hamburger_slice" />
            </label>
          </div>
        </div>
        <div className="nav_logo">
          <span className="logo">BETTY</span>
        </div>

        <a className="nav-link hover:text-blue-500 cursor-pointer">
          <button onClick={clickRotoNfl}>ROTO</button>
        </a>
        <a className="nav-link-m-left hover:text-blue-500 cursor-pointer">
          CHAT
        </a>
        <a className="nav-link-m-left hover:text-blue-500 cursor-pointer">
          FRIENDS
        </a>
      </div>
    </nav>
  );
}
