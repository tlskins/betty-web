import React from "react";

import { NewBet } from "../components/bets/newBet";
import { CurrentGames } from "./gamesSideBar";

export function NewBetSideBar({ profileId, show, hide, setAlertMsg }) {
  const navClass = show
    ? "nav-sidebar w-11/12 lg:w-8/12"
    : "nav-sidebar-hidden";
  const overlayClass = show ? "nav-overlay" : "nav-overlay-hidden";

  return (
    <div className="nav-sidebar-wrapper">
      <label className={overlayClass} onClick={hide}>
        <div className="nav-overlay-cover" />
      </label>
      <nav className={navClass}>
        <div className="page-wrapper flex mt-8 items-center content-center justify-center">
          <NewBet setAlertMsg={setAlertMsg} profileId={profileId} />
        </div>
        <div className="page-wrapper flex-col p-8 mt-10 hidden lg:flex">
          <label className="nav-sidebar-list-label p-8">
            <span className="nav-sidebar-list-txt">Current Games</span>
          </label>
          <CurrentGames />
        </div>
      </nav>
    </div>
  );
}
