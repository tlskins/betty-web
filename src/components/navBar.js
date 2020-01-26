import React, { useState, Fragment } from "react";
import { Redirect } from "@reach/router";
import { useMutation, useApolloClient } from "@apollo/react-hooks";

import gql from "graphql-tag";

export const GET_PROFILE = gql`
  {
    profile @client {
      id
      name
      userName
      twitterUser {
        idStr
        screenName
        name
      }
    }
  }
`;

const LOG_OUT = gql`
  mutation signOut {
    signOut
  }
`;

export function NavBar({ clickRoto, clickProfile }) {
  const client = useApolloClient();
  const [logout, _] = useMutation(LOG_OUT, {
    onCompleted(data) {
      if (data && data.signOut) {
        client.resetStore();
        localStorage.clear();
        setRedirectTo("/login");
      }
    }
  });
  const [redirectTo, setRedirectTo] = useState(undefined);
  const profile = JSON.parse(localStorage.getItem("profile"));

  return (
    <nav className="nav-bar">
      <div className="nav-hdr-content">
        <div className="nav-menu-container">
          {profile && (
            <div>
              <label className="nav_hamburger" onClick={clickProfile}>
                <span className="hamburger_slice" />
                <span className="hamburger_slice" />
                <span className="hamburger_slice" />
              </label>
            </div>
          )}
        </div>
        <div className="nav_logo">
          <a className="logo" href="/">
            BETTY
          </a>
        </div>

        <a className="nav-link hover:text-blue-500 cursor-pointer">
          <button onClick={clickRoto}>ROTO</button>
        </a>
        {profile && (
          <Fragment>
            <a
              className="nav-link-m-left hover:text-blue-500 cursor-pointer"
              href="/bets"
            >
              <button>YOUR BETS</button>
            </a>
            <a
              className="nav-link-m-left hover:text-blue-500 cursor-pointer"
              onClick={logout}
            >
              <button>LOGOUT</button>
            </a>
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
      </div>
    </nav>
  );
}
