import React, { Fragment, useState } from "react";
import { Router } from "@reach/router";

import { YourBets } from "./yourBets";
import { BrowseBets } from "./browseBets";
import { BetDetail } from "./betDetail";
import { Info } from "./info";
import { SignIn } from "./signIn";
import { NavBar } from "../components/navBar";
import { RotoSideBar } from "../components/rotoSideBar";
import { ProfileSideBar } from "../components/profileSideBar";
import { UserAlerts } from "../components/userAlerts";
import { Alert } from "../components/alert";

export default function Pages() {
  const sessionProfile = JSON.parse(localStorage.getItem("profile"));
  const [profile, setProfile] = useState(sessionProfile);
  const [showSideBar, setShowSideBar] = useState(undefined);
  const [alertMsg, setAlertMsg] = useState(undefined);
  return (
    <div>
      <NavBar
        profile={profile}
        setProfile={setProfile}
        clickRoto={() => setShowSideBar("roto")}
        clickProfile={() => setShowSideBar("profile")}
      />
      {profile && (
        <Fragment>
          <ProfileSideBar
            profile={profile}
            setProfile={setProfile}
            show={showSideBar === "profile"}
            hide={() => setShowSideBar(undefined)}
          />
          <RotoSideBar
            show={showSideBar === "roto"}
            hide={() => setShowSideBar(undefined)}
          />
          <Alert
            title={alertMsg}
            open={alertMsg !== undefined}
            onClose={() => setAlertMsg(undefined)}
          />
          <UserAlerts />
        </Fragment>
      )}

      <Router primary={false} component={Fragment}>
        <BrowseBets path="/" profile={profile} />
        <Info path="/info" profile={profile} />
        <YourBets path="/bets" profile={profile} setAlertMsg={setAlertMsg} />
        <SignIn
          path="/login"
          setProfile={setProfile}
          setAlertMsg={setAlertMsg}
        />
        <BetDetail
          path="/bet/:betId"
          profile={profile}
          setAlertMsg={setAlertMsg}
        />
      </Router>
    </div>
  );
}
