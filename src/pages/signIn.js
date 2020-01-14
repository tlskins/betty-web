import React, { useState } from "react";
import { Redirect } from "@reach/router";
import { useMutation, useLazyQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { apolloClient } from "../index";

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
  const [signIn, _] = useLazyQuery(SIGN_IN, {
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
  return (
    <div className="page-layout-wrapper">
      <div className="page-layout">
        <div className="page-inner-layout">
          <div className="page-hdr-box">
            <h3 className="page-hdr">
              <input
                type="text"
                onChange={e => setUserName(e.target.value)}
                placeholder="username"
              />
              <input
                type="text"
                onChange={e => setPassword(e.target.value)}
                placeholder="password"
              />
              <button
                onClick={() => signIn({ variables: { userName, password } })}
              >
                Log In
              </button>
              {redirect && <Redirect to="/" noThrow />}
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
}
