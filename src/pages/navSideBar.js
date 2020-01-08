import React from "react";

export function NavSideBar({ show, hide }) {
  const navClass = show ? "nav-sidebar" : "nav-sidebar-hidden";
  const overlayClass = show ? "nav-overlay" : "nav-overlay-hidden";

  return (
    <div className="nav-sidebar-wrapper">
      <label className={overlayClass} onClick={hide}>
        <div className="nav-overlay-cover" />
      </label>
      <nav className={navClass}>
        <ul className="nav-sidebar-list">
          <li className="nav-sidebar-list-item">
            <div>
              <label className="nav-sidebar-list-label">
                <span className="nav-sidebar-list-txt">chat</span>
              </label>
            </div>
          </li>
        </ul>
      </nav>
    </div>
  );
}
