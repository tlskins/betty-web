import React, { Fragment, useState } from "react";
import { useMutation } from "@apollo/react-hooks";
import { Router } from "@reach/router";
import gql from "graphql-tag";

import { YourBets } from "./yourBets";
import { BrowseBets } from "./browseBets";
import { BetDetail } from "./betDetail";
import { Info } from "./info";
import { SignIn } from "./signIn";
import { NavBar } from "../components/navBar";
import { RotoSideBar } from "../components/rotoSideBar";
import { ProfileSideBar } from "../components/profileSideBar";
import { GamesSideBar } from "../components/gamesSideBar";
import { Alert } from "../components/alert";

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
        clickGames={() => setShowSideBar("games")}
        clickRoto={() => setShowSideBar("roto")}
        clickProfile={() => {
          viewProfile({ variables: { sync: false } });
          setShowSideBar("profile");
        }}
      />
      <Alert
        title={alertMsg}
        open={alertMsg != undefined}
        onClose={() => setAlertMsg(undefined)}
      />
      {profile && (
        <Fragment>
          <ProfileSideBar
            profile={profile}
            setProfile={setProfile}
            show={showSideBar === "profile"}
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
            show={showSideBar === "games"}
            hide={() => setShowSideBar(undefined)}
          />
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

export const VIEW_PROFILE = gql`
  mutation viewProfile($sync: Boolean!) {
    viewProfile(sync: $sync) {
      id
      name
      userName
      email
      viewedProfileLast
      betsWon
      betsLost
      inProgressBetIds
      pendingYouBetIds
      pendingThemBetIds
      twitterUser {
        idStr
        screenName
        name
      }
      notifications {
        id
        sentAt
        title
        type
        message
      }
    }
  }
`;
