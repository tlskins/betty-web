import React, { useState, useEffect, Fragment } from "react";
import { Redirect } from "@reach/router";
import {
  useMutation,
  useSubscription,
  useApolloClient
} from "@apollo/react-hooks";
import gql from "graphql-tag";

import { Alert } from "../components/alert";
import { toMoment } from "../utils";
import UserFrags from "../fragments/user";

export function NavBar({
  clickNewBet,
  clickGames,
  clickRoto,
  clickNotifications,
  profile,
  setProfile
}) {
  const client = useApolloClient();
  const [logout] = useMutation(LOG_OUT, {
    onCompleted(data) {
      if (data?.signOut) {
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
  useEffect(() => {
    if (redirectTo) {
      setRedirectTo(undefined);
    }
  }, [redirectTo, setRedirectTo]);
  const [alertMsg, setAlertMsg] = useState(undefined);
  const [showDropdown, setShowDropdown] = useState(false);
  const newNotesCount = newNotifications(profile);

  return (
    <nav className="nav-bar sm:absolute md:sticky w-full">
      <div className="nav-hdr-content px-10 lg:px-40">
        <div className="nav_logo">
          <a className="logo" href="/">
            BETTY
          </a>
          {profile && (
            <Fragment>
              <label
                className="nav_hamburger"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <span className="hamburger_slice" />
                <span className="hamburger_slice" />
                <span className="hamburger_slice" />
              </label>
              {newNotesCount > 0 && (
                <span className="bg-indigo-400 text-white rounded-full mx-2 mb-3 py-1 px-2 font-sans">
                  {newNotesCount}
                </span>
              )}
            </Fragment>
          )}
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
        className={`absolute max-w-sm bg-white rounded border-2 border-teal-700 overflow-hidden shadow-lg ml-0 md:ml-32 z-20 text-teal-700 font-sans uppercase tracking-wider font-bold text-xs items-center content-center justify-center text-center`}
        style={{
          transition: `all 600ms ease 0s`,
          top: showDropdown ? `65px` : `-420px`
        }}
      >
        <div
          className="cursor-pointer px-4 py-6 shadow hover:bg-teal-300 hover:underline"
          onClick={() => {
            setShowDropdown(false);
            setRedirectTo("/");
          }}
        >
          Arena
        </div>
        <div
          className="cursor-pointer px-4 py-6 shadow hover:bg-teal-300 hover:underline"
          onClick={clickGames}
        >
          Current Games
        </div>
        <div
          className="cursor-pointer px-4 py-6 shadow hover:bg-teal-300 hover:underline"
          onClick={clickRoto}
        >
          Sports News
        </div>
        <div className="border-b-4 m-0"></div>
        <div
          className="cursor-pointer px-4 py-6 shadow hover:bg-teal-300 hover:underline"
          onClick={clickNewBet}
        >
          New Bet
        </div>
        <div
          className="cursor-pointer px-4 py-6 shadow hover:bg-teal-300 hover:underline"
          onClick={() => {
            setShowDropdown(false);
            setRedirectTo(`/users/${profile.id}`);
          }}
        >
          Profile
        </div>
        <div
          className="cursor-pointer px-4 py-6 shadow hover:bg-teal-300 hover:underline"
          onClick={clickNotifications}
        >
          <div>
            Notifications
            {newNotesCount > 0 && (
              <span className="bg-indigo-400 text-white rounded-full mx-2 py-1 px-2">
                {newNotesCount}
              </span>
            )}
          </div>
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
      ...Profile
    }
  }
  ${UserFrags.fragments.profile}
`;

const LOG_OUT = gql`
  mutation signOut {
    signOut
  }
`;
