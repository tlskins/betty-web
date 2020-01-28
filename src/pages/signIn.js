import React, { useState } from "react";
import { Redirect } from "@reach/router";
import { useLazyQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";

import { NavBar } from "../components/navBar";
import { RotoSideBar } from "../components/rotoSideBar";
import { Alert } from "../components/alert";

export const SIGN_IN = gql`
  query signIn($userName: String!, $password: String!) {
    signIn(userName: $userName, password: $password) {
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

export function RegistrationDetails() {
  return (
    <div>
      <h4 className="m-2 text-lg">
        <b>New User? </b> Register through twitter!
      </h4>
      <ol type="1">
        <li className="m-2">
          <b>1.</b> Follow{" "}
          <span className="text-blue-600 font-bold">@bettybetbot</span> (so you
          can receive a confirmation dm from her)
        </li>
        <li className="m-2">
          <b>2.</b> Send a tweet to{" "}
          <span className="text-blue-600 font-bold">@bettybetbot</span> to
          register your user name ie:{" "}
          <span className="font-medium font-mono">
            "@bettybetbot register DrJackBlack"
          </span>
        </li>
        <li className="m-2">
          You will receive a dm from{" "}
          <span className="text-blue-600 font-bold">@bettybetbot</span>
          with the username: <b>DrJackBlack</b> and your temporary password
        </li>
      </ol>
    </div>
  );
}

export function SignIn() {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [redirect, setRedirect] = useState(false);
  const [alertMsg, setAlertMsg] = useState(undefined);
  const [showSideBar, setShowSideBar] = useState(undefined);

  const [signIn] = useLazyQuery(SIGN_IN, {
    onError(error) {
      setAlertMsg(error.message);
    },
    onCompleted(data) {
      if (data && data.signIn) {
        localStorage.setItem("profile", JSON.stringify(data.signIn));
        setRedirect(true);
      }
    }
  });

  return (
    <div className="page-layout-wrapper">
      <NavBar clickRoto={() => setShowSideBar("roto")} />
      <RotoSideBar
        show={showSideBar === "roto"}
        hide={() => setShowSideBar(undefined)}
      />
      <Alert
        title={alertMsg}
        open={alertMsg !== undefined}
        onClose={() => setAlertMsg(undefined)}
      />
      <div className="page-layout">
        <div className="page-inner-layout">
          <div className="page-wrapper my-10">
            <div className="page-content">
              <div className="page-content-area flex-row">
                <div className="p-8">
                  <input
                    className="block border border-black rounded p-2 m-2"
                    type="text"
                    onChange={e => setUserName(e.target.value)}
                    placeholder="username"
                  />
                  <input
                    className="block border border-black rounded p-2 m-2"
                    type="password"
                    onChange={e => setPassword(e.target.value)}
                    placeholder="password"
                  />
                  <button
                    className="block border border-black rounded p-2 m-2"
                    onClick={() =>
                      signIn({ variables: { userName, password } })
                    }
                  >
                    Log In
                  </button>
                  {redirect && <Redirect to="/bets" noThrow />}
                </div>
                <div className="p-8 font-sans">
                  <RegistrationDetails />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
