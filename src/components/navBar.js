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
      const profile = data?.subscriptionData?.data?.subscribeUserNotifications;
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
  const [showDropdown, setShowDropdown] = useState(false);
  const newNotesCount = newNotifications(profile);

  return (
    <nav className="nav-bar sm:absolute md:sticky">
      <div className="nav-hdr-content">
        <div className="nav_logo">
          <a className="logo" href="/">
            BETTY
          </a>
          <label
            className="nav_hamburger"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <span className="hamburger_slice" />
            <span className="hamburger_slice" />
            <span className="hamburger_slice" />
          </label>
        </div>

        {profile && (
          <button
            className="nav-link hover:text-blue-500 cursor-pointer ml-4"
            onClick={logout}
          >
            LOGOUT
          </button>
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
      <div
        class={`absolute max-w-sm bg-white rounded border-2 border-teal-700 overflow-hidden shadow-lg ml-16 z-20 text-teal-700 font-sans uppercase tracking-wider font-bold text-xs items-center content-center justify-center text-center`}
        style={{
          transition: `all 600ms ease 0s`,
          top: showDropdown ? `65px` : `-420px`
        }}
      >
        <div
          class="cursor-pointer px-4 py-6 shadow hover:bg-teal-300 hover:underline"
          onClick={() => {
            setShowDropdown(false);
            setRedirectTo("/");
          }}
        >
          Marketplace
        </div>
        <div class="cursor-pointer px-4 py-6 shadow hover:bg-teal-300 hover:underline">
          Current Games
        </div>
        <div class="border-b-4 m-0"></div>
        <div
          class="cursor-pointer px-4 py-6 shadow hover:bg-teal-300 hover:underline"
          onClick={() => {
            setShowDropdown(false);
            setRedirectTo("/bets");
          }}
        >
          My Bets
        </div>
        <div
          class="cursor-pointer px-4 py-6 shadow hover:bg-teal-300 hover:underline"
          onClick={clickRoto}
        >
          Roto
        </div>
        <div class="cursor-pointer px-4 py-6 shadow hover:bg-teal-300 hover:underline">
          Profile
        </div>
        <div
          class="cursor-pointer px-4 py-6 shadow hover:bg-teal-300 hover:underline"
          onClick={clickProfile}
        >
          Notifications
        </div>
      </div>
    </nav>
  );
}

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
