import React, { Fragment, useState } from "react";
import { useMutation } from "@apollo/react-hooks";
import { Router } from "@reach/router";
import gql from "graphql-tag";

import { BrowseBets } from "./browseBets";
import { BetDetail } from "./betDetail";
import { SignIn } from "./signIn";
import { UserProfile } from "./userProfile";
import { NavBar } from "../components/navBar";
import { RotoSideBar } from "../components/rotoSideBar";
import { NotificationsSideBar } from "../components/notificationsSideBar";
import { GamesSideBar } from "../components/gamesSideBar";
import { NewBetSideBar } from "../components/newBetSideBar";
import { Alert } from "../components/alert";
import UserFrags from "../fragments/user";

export default function Pages() {
  let sessionProfile = localStorage.getItem("profile");
  try {
    sessionProfile = sessionProfile ? JSON.parse(sessionProfile) : undefined;
  } catch (e) {
    sessionProfile = undefined;
  }
  const [profile, setProfile] = useState(sessionProfile);
  const [showSideBar, setShowSideBar] = useState(undefined);
  const [alertMsg, setAlertMsg] = useState(undefined);
  const [viewProfile] = useMutation(VIEW_PROFILE, {
    onCompleted(data) {
      const profile = data && data.viewProfile;
      if (profile) {
        localStorage.setItem("profile", JSON.stringify(profile));
        setProfile(profile);
      }
    }
  });

  return (
    <div>
      <NavBar
        profile={profile}
        setProfile={setProfile}
        clickNewBet={() => setShowSideBar("newBet")}
        clickGames={() => setShowSideBar("games")}
        clickRoto={() => setShowSideBar("roto")}
        clickNotifications={() => {
          viewProfile({ variables: { sync: false } });
          setShowSideBar("notifications");
        }}
      />
      <Alert
        title={alertMsg}
        open={alertMsg !== undefined}
        onClose={() => setAlertMsg(undefined)}
      />
      {profile && (
        <Fragment>
          <NotificationsSideBar
            profile={profile}
            show={showSideBar === "notifications"}
            hide={() => {
              setShowSideBar(undefined);
              viewProfile({ variables: { sync: true } });
            }}
          />
          <RotoSideBar
            show={showSideBar === "roto"}
            hide={() => setShowSideBar(undefined)}
          />
          <GamesSideBar
            setAlertMsg={setAlertMsg}
            show={showSideBar === "games"}
            hide={() => setShowSideBar(undefined)}
          />
          <NewBetSideBar
            show={showSideBar === "newBet"}
            hide={() => setShowSideBar(undefined)}
          />
        </Fragment>
      )}

      <Router primary={false} component={Fragment}>
        <BrowseBets path="/" profile={profile} />
        <UserProfile path="/users/:userId" profile={profile} />
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

export const VIEW_PROFILE = gql`
  mutation viewProfile($sync: Boolean!) {
    viewProfile(sync: $sync) {
      ...Profile
    }
  }
  ${UserFrags.fragments.profile}
`;
