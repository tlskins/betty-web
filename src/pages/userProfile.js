import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";

import { BetTabs } from "../components/betTabs";
import UserFrags from "../fragments/user";
import BetFrags from "../fragments/bet";

export function UserProfile({ userId, profile, setAlertMsg }) {
  const { data } = useQuery(GET_USER, {
    variables: { userId }
  });
  const { data: betsData } = useQuery(GET_BETS, {
    variables: { userId }
  });

  const {
    name,
    userName,
    betsWon,
    betsLost,
    inProgressBetIds = [],
    pendingYouBetIds = [],
    pendingThemBetIds = []
  } = data?.getUser || {};
  const twtName = data?.getUser?.twitterUser?.name || "";
  const twtScreenName = data?.getUser?.twitterUser?.screenName || "";
  const isMyProfile = userId === profile?.id;

  const publicBets = betsData?.bets?.publicPendingBets || [];
  const finalBets = betsData?.bets?.finalBets || [];
  const acceptedBets = betsData?.bets?.acceptedBets || [];
  const pendingBets = betsData?.bets?.pendingBets || [];
  const rejectedBets = betsData?.bets?.closedBets || [];

  return (
    <div className="page-layout-wrapper">
      <div className="page-layout">
        <div className="w-full lg:w-1/2 p-4 ">
          <div className="page-hdr-box">
            <h3 className="page-hdr">{name}</h3>
          </div>

          <div className="page-wrapper items-center content-center justify-center text-center">
            <div className="mt-6 p-4 bg-gray-300 font-serif text-xs">
              <ul>
                <li>
                  <span className="font-bold">Bets Won:</span> {betsWon}
                </li>
                <li>
                  <span className="font-bold">Bets Lost:</span> {betsLost}
                </li>
                <li>
                  <span className="font-bold">Bets In Progress:</span>{" "}
                  {inProgressBetIds.length}
                </li>
                <li>
                  <span className="font-bold">Bets pending your approval:</span>{" "}
                  {pendingYouBetIds.length}
                </li>
                <li>
                  <span className="font-bold">
                    Bets pending their approval:
                  </span>{" "}
                  {pendingThemBetIds.length}
                </li>
              </ul>
            </div>

            <div className="mt-6">
              <ul className="p-4 bg-blue-200 rounded text-xs font-sans">
                <li>
                  <span className="font-semibold">Twitter</span>
                </li>
                <li>
                  <span className="font-medium">screen name:</span> @
                  {twtScreenName}
                </li>
                <li>
                  <span className="font-medium">name:</span> {twtName}
                </li>
              </ul>
            </div>

            {isMyProfile && (
              <div className="mt-10 flex items-center content-center justify-center">
                <ProfileForm
                  name={name}
                  userName={userName}
                  setAlertMsg={setAlertMsg}
                />
              </div>
            )}
          </div>

          <div className="page-hdr-box">
            <h3 className="page-hdr">User Bets</h3>
          </div>

          <div className="page-wrapper mt-10">
            <div className="page-content">
              <div className="page-content-area flex justify-center">
                <div className="page-content-area flex items-center content-center justify-center">
                  <BetTabs
                    profile={profile}
                    acceptedBets={acceptedBets}
                    finalBets={finalBets}
                    publicPendingBets={publicBets}
                    pendingBets={pendingBets}
                    rejectedBets={rejectedBets}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileForm({ name, userName, setAlertMsg }) {
  const [newName, setName] = useState(name);
  const [password, setPassword] = useState(undefined);
  const [confirmation, setConfirmation] = useState(undefined);
  const [newUserName, setUserName] = useState(userName);
  const [updateUser] = useMutation(UPDATE_USER, {
    onCompleted(data) {
      if (data?.error) {
        setAlertMsg(data.error.message);
      } else if (data) {
        setAlertMsg("Updates saved!");
        setPassword(""); // text input doesnt clear on undefined value
        setConfirmation("");
        setPassword(undefined);
        setConfirmation(undefined);
      }
    }
  });

  const onUpdate = e => {
    e.preventDefault();
    if (password && confirmation !== password) {
      setAlertMsg("Password and confirmation don't match!");
      return;
    }
    if (password && password.length < 6) {
      setAlertMsg("Password must be at least 6 characters long");
      return;
    }
    if (userName.length < 5) {
      setAlertMsg("User name must be at least 5 characters long");
      return;
    }
    const changes = { name, userName, password };
    updateUser({ variables: { changes } });
  };

  return (
    <form className="max-w-xl m-4 p-10 bg-white rounded shadow-xl ">
      <div className="">
        <label className="block text-sm text-gray-00" htmlFor="name">
          Name
        </label>
        <input
          className="w-full px-5 py-1 text-gray-700 bg-gray-200 rounded"
          id="name"
          name="name"
          type="text"
          placeholder="Name"
          aria-label="Name"
          value={newName}
          onChange={e => setName(e.target.value)}
        />
      </div>
      <div className="mt-2">
        <label className="block text-sm text-gray-600" htmlFor="userName">
          User Name
        </label>
        <input
          className="w-full px-5  py-1 text-gray-700 bg-gray-200 rounded"
          id="userName"
          name="userName"
          type="text"
          placeholder="User Name"
          aria-label="UserName"
          value={newUserName}
          onChange={e => setUserName(e.target.value)}
        />
      </div>
      <div className="mt-2">
        <label className="block text-sm text-gray-600" htmlFor="password">
          Password
        </label>
        <input
          className="w-full px-5 py-2 text-gray-700 bg-gray-200 rounded"
          id="password"
          name="password"
          type="password"
          placeholder="new password"
          aria-label="password"
          value={password}
          onChange={e => {
            if (e.target.value === "") {
              setPassword(undefined);
            } else {
              setPassword(e.target.value);
            }
          }}
        />
        <input
          className="w-full mt-2 px-5 py-2 text-gray-700 bg-gray-200 rounded"
          id="confirmation"
          name="confirmation"
          type="password"
          placeholder="confirmation"
          aria-label="confirmation"
          value={confirmation}
          onChange={e => setConfirmation(e.target.value)}
        />
      </div>
      <div className="mt-4">
        <button
          className="px-4 py-1 text-white font-light tracking-wider bg-gray-900 rounded"
          type="submit"
          onClick={onUpdate}
        >
          Update Profile
        </button>
      </div>
    </form>
  );
}

export const GET_USER = gql`
  query getUser($userId: String!) {
    getUser(userId: $userId) {
      ...Profile
    }
  }
  ${UserFrags.fragments.profile}
`;

export const UPDATE_USER = gql`
  mutation updateUser($changes: ProfileChanges!) {
    updateUser(changes: $changes) {
      ...Profile
    }
  }
  ${UserFrags.fragments.profile}
`;

export const GET_BETS = gql`
  query bets {
    bets {
      acceptedBets {
        ...BetDetail
      }
      finalBets {
        ...BetDetail
      }
      publicPendingBets {
        ...BetDetail
      }
      pendingBets {
        ...BetDetail
      }
      closedBets {
        ...BetDetail
      }
    }
  }
  ${BetFrags.fragments.bet}
`;
