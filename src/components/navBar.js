import React, { useState, Fragment } from "react";
import { Redirect } from "@reach/router";
import {
  useMutation,
  useSubscription,
  useApolloClient
} from "@apollo/react-hooks";
import gql from "graphql-tag";

import { Alert } from "../components/alert";
import { toMoment } from "../utils";

export const SUBSCRIBE_USER_PROFILE = gql`
  subscription subscribeUserNotifications {
    subscribeUserNotifications {
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

const LOG_OUT = gql`
  mutation signOut {
    signOut
  }
`;

function newNotifications(profile) {
  if (
    !profile ||
    !profile.notifications ||
    profile.notifications.length === 0
  ) {
    return 0;
  }
  if (!profile.viewedProfileLast) {
    return profile.notifications.length;
  }
  const lastView = toMoment(profile.viewedProfileLast);
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
  useSubscription(SUBSCRIBE_USER_PROFILE, {
    onSubscriptionData(data) {
      const profile =
        data &&
        data.subscriptionData &&
        data.subscriptionData.data &&
        data.subscriptionData.data.subscribeUserNotifications;
      if (profile) {
        if (profile.id.length > 0) {
          // workaround for single ws and non persisted push notes
          localStorage.setItem("profile", JSON.stringify(profile));
          setProfile(profile);
        }
        if (profile.notifications.length > 0) {
          setAlertMsg(profile.notifications[0].title);
        }
      }
    }
  });
  const [redirectTo, setRedirectTo] = useState(undefined);
  const [alertMsg, setAlertMsg] = useState(undefined);
  const newNotesCount = newNotifications(profile);

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
              PROFILE{" "}
              {newNotesCount > 0 && (
                <span className="bg-indigo-400 text-white rounded-full py-1 px-2">
                  {newNotesCount}
                </span>
              )}
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
