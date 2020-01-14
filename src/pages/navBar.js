import React, { useState } from "react";
import { Redirect } from "@reach/router";
import { useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";

import { apolloClient } from "../index";
import "./styles.css";

const LOG_OUT = gql`
  mutation signOut {
    signOut
  }
`;

export function NavBar({ clickRotoNfl }) {
  const [logout, _] = useMutation(LOG_OUT, {
    onCompleted(data) {
      console.log("data", data);
      if (data && data.signOut) {
        apolloClient.resetStore();
        setRedirectLogin(true);
      }
    }
  });
  const [redirectLogin, setRedirectLogin] = useState(false);

  return (
    <nav className="nav-bar">
      <div className="nav-hdr-content">
        <div className="nav-menu-container">
          <div>
            <label className="nav_hamburger">
              <span className="hamburger_slice" />
              <span className="hamburger_slice" />
              <span className="hamburger_slice" />
            </label>
          </div>
        </div>
        <div className="nav_logo">
          <span className="logo">BETTY</span>
        </div>

        <a className="nav-link hover:text-blue-500 cursor-pointer">
          <button onClick={clickRotoNfl}>ROTO</button>
        </a>
        <a className="nav-link-m-left hover:text-blue-500 cursor-pointer">
          CHAT
        </a>
        <a className="nav-link-m-left hover:text-blue-500 cursor-pointer">
          FRIENDS
        </a>
        <a className="nav-link-m-left hover:text-blue-500 cursor-pointer">
          <button onClick={logout}>LOGOUT</button>
          {redirectLogin && <Redirect to="/login" noThrow />}
        </a>
      </div>
    </nav>
  );
}
