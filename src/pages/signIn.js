import React, { useState, useEffect } from "react";
import { Redirect } from "@reach/router";
import { useLazyQuery, useApolloClient } from "@apollo/react-hooks";
import gql from "graphql-tag";

import { NavBar } from "../components/navBar";
import { RotoSideBar } from "../components/rotoSideBar";
import { RotoAlerts } from "../components/rotoAlerts";
import { Alert } from "../components/alert";

export const SIGN_IN = gql`
  query signIn($userName: String!, $password: String!) {
    signIn(userName: $userName, password: $password) {
      id
      userName
      name
    }
  }
`;

export function SignIn() {
  const apolloClient = useApolloClient();
  const [signIn, signInResponse] = useLazyQuery(SIGN_IN, {
    onCompleted(data) {
      if (data && data.signIn) {
        apolloClient.writeData({ data: { profile: data.signIn } });
        setRedirect(true);
      }
    }
  });
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [redirect, setRedirect] = useState(false);
  const [alertMsg, setAlertMsg] = useState(undefined);
  const [showSideBar, setShowSideBar] = useState(undefined);

  useEffect(() => {
    if (signInResponse && signInResponse.error) {
      setAlertMsg(signInResponse.error.message);
    }
    return function cleanup() {
      setAlertMsg(undefined);
    };
  }, [signInResponse]);

  return (
    <div className="page-layout-wrapper">
      <NavBar clickRotoNfl={() => setShowSideBar("RotoNfl")} />
      <RotoSideBar
        show={showSideBar == "RotoNfl"}
        hide={() => setShowSideBar(undefined)}
      />
      <RotoAlerts />
      <Alert
        title={alertMsg}
        open={alertMsg != undefined}
        onClose={() => setAlertMsg(undefined)}
      />
      <div className="page-layout">
        <div className="page-inner-layout">
          <div className="page-wrapper my-10">
            <div className="page-content">
              <div className="page-content-area">
                <div className="p-8">
                  <input
                    className="block"
                    type="text"
                    onChange={e => setUserName(e.target.value)}
                    placeholder="username"
                  />
                  <input
                    className="block"
                    type="text"
                    onChange={e => setPassword(e.target.value)}
                    placeholder="password"
                  />
                  <button
                    className="block"
                    onClick={() =>
                      signIn({ variables: { userName, password } })
                    }
                  >
                    Log In
                  </button>
                  {redirect && <Redirect to="/bets" noThrow />}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
