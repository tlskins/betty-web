import React from "react";
import "./styles.css";

export function NavBar() {
  return (
    <nav className="nav_bar">
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
        <a className="nav-link">CHAT</a>
        <a className="nav-link-m-left">FRIENDS</a>
      </div>
    </nav>
  );
}
