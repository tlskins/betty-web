import React, { useState, Fragment } from "react";
import { Redirect } from "@reach/router";
import {
  useMutation,
  useSubscription,
  useApolloClient
} from "@apollo/react-hooks";
import gql from "graphql-tag";

import { SUBSCRIBE_USER_PROFILE } from "../components/profileSideBar";
import { Alert } from "../components/alert";
import { toMoment } from "../utils";

const LOG_OUT = gql`
  mutation signOut {
    signOut
  }
`;

function newNotifications(profile) {
  if (!profile || !profile.notifications || profile.notifications.length == 0) {
    return 0;
  }
  if (!profile.viewedProfileLast) {
    return profile.notifications.length;
  }
  const lastView = toMoment(profile.viewedProfileLast);
  console.log("lastview", lastView);
  return profile.notifications.filter(n =>
    lastView.isBefore(toMoment(n.sentAt))
  ).length;
}

export function NavBar({ clickRoto, clickProfile, profile, setProfile }) {
  const client = useApolloClient();
  const [logout] = useMutation(LOG_OUT, {
    onCompleted(data) {
      if (data && data.signOut) {
        client.resetStore();
        localStorage.clear();
        setRedirectTo("/login");
      }
    }
  });
  const { data } = useSubscription(SUBSCRIBE_USER_PROFILE, {
    onSubscriptionData(data) {
      console.log("onSubscriptionData:", data);
      const profile =
        data &&
        data.subscriptionData &&
        data.subscriptionData.data &&
        data.subscriptionData.data.subscribeUserNotifications;
      if (profile) {
        setProfile(profile);
        setNewNotes(newNotifications(profile));
      }
    }
  });
  console.log("subscription profile data:", data);
  const [redirectTo, setRedirectTo] = useState(undefined);
  const [alertMsg, setAlertMsg] = useState(undefined);
  const [newNotes, setNewNotes] = useState(newNotifications(profile));
  console.log("newNotesCount: ", newNotes);

  return (
    <nav className="nav-bar">
      <div className="nav-hdr-content">
        <div className="nav_logo">
          <a className="logo" href="/">
            BETTY
          </a>
        </div>
        <a
          className="nav-link-m-left hover:text-blue-500 cursor-pointer"
          href="/info"
        >
          INFO
        </a>
        {profile && (
          <a
            className="nav-link-m-left hover:text-blue-500 cursor-pointer"
            href="/bets"
          >
            MY BETS
          </a>
        )}
        <div
          className="nav-link m-6"
          style={{
            borderLeft: `3px solid lightgray`,
            height: `20px`,
            borderRadius: `8px`
          }}
        />

        {profile && (
          <Fragment>
            <button
              className="nav-link hover:text-blue-500 cursor-pointer"
              onClick={clickRoto}
            >
              ROTO
            </button>
            <button
              className="nav-link-m-left hover:text-blue-500 cursor-pointer"
              onClick={clickProfile}
            >
              PROFILE {newNotes > 0 && `(${newNotes})`}
            </button>
            <button
              className="nav-link-m-left hover:text-blue-500 cursor-pointer"
              onClick={logout}
            >
              LOGOUT
            </button>
          </Fragment>
        )}

        {!profile && (
          <a
            className="nav-link-m-left hover:text-blue-500 cursor-pointer"
            href="/login"
          >
            <button>LOGIN</button>
          </a>
        )}
        {redirectTo && <Redirect to={redirectTo} noThrow />}
        <Alert
          title={alertMsg}
          open={alertMsg !== undefined}
          onClose={() => setAlertMsg(undefined)}
        />
      </div>
    </nav>
  );
}
