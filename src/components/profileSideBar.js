import React, { useState, useEffect } from "react";
import { useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";

import { Alert } from "../components/alert";

export const UPDATE_USER = gql`
  mutation updateUser($name: String, $userName: String, $password: String) {
    updateUser(name: $name, userName: $userName, password: $password) {
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

export function ProfileSideBar({ show, hide }) {
  const [showing, setShowing] = useState(false);
  const [updateUser, { data }] = useMutation(UPDATE_USER);
  const [alertMsg, setAlertMsg] = useState(undefined);
  const navClass = show ? "nav-sidebar" : "nav-sidebar-hidden";
  const overlayClass = show ? "nav-overlay" : "nav-overlay-hidden";

  console.log("data", data);

  useEffect(() => {
    if (data && data.error) {
      setAlertMsg(data.error.message);
    } else if (data) {
      setAlertMsg("Updates saved!");
    }
    return function cleanup() {
      setAlertMsg(undefined);
    };
  }, [data]);

  if (showing && !show) {
    setShowing(false);
  }

  return (
    <div className="nav-sidebar-wrapper">
      <label className={overlayClass} onClick={hide}>
        <div className="nav-overlay-cover" />
      </label>
      <nav className={navClass}>
        {show && <Profile updateUser={updateUser} setAlertMsg={setAlertMsg} />}
      </nav>
      <Alert
        title={alertMsg}
        open={alertMsg != undefined}
        onClose={() => setAlertMsg(undefined)}
      />
    </div>
  );
}

function Profile({ setAlertMsg, updateUser }) {
  const profile = JSON.parse(localStorage.getItem("profile"));

  return (
    <ProfileForm
      profile={profile}
      setAlertMsg={setAlertMsg}
      updateUser={updateUser}
    />
  );
}

function ProfileForm({ profile, setAlertMsg, updateUser }) {
  const [name, setName] = useState(profile.name);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [userName, setUserName] = useState(profile.userName);

  const twtName = (profile.twitterUser && profile.twitterUser.name) || "";
  const twtScreenName =
    (profile.twitterUser && profile.twitterUser.screenName) || "";

  const onUpdate = e => {
    e.preventDefault();
    if (password.length > 0 && confirmation !== password) {
      setAlertMsg("Password and confirmation don't match!");
      return;
    }
    if (password.length > 0 && password.length < 6) {
      setAlertMsg("Password must be at least 6 characters long");
      return;
    }
    if (userName.length < 5) {
      setAlertMsg("User name must be at least 5 characters long");
      return;
    }
    const variables = { name, userName };
    if (password.length > 5) {
      variables.password = password;
    }
    updateUser({
      variables,
      onCompleted(data) {
        setPassword("");
        setConfirmation("");
      }
    });
  };

  return (
    <div className="leading-loose">
      <form className="max-w-xl m-4 p-10 bg-white rounded shadow-xl">
        <p className="text-gray-800 font-medium m-2">Profile</p>
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
            value={name}
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
            value={userName}
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
            onChange={e => setPassword(e.target.value)}
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
        <div className="mt-6">
          <ul className="p-4 bg-blue-200 rounded text-xs font-sans">
            <li>
              <span className="font-semibold">Twitter</span>
            </li>
            <li>
              <span className="font-medium">screen name:</span> @{twtScreenName}
            </li>
            <li>
              <span className="font-medium">name:</span> {twtName}
            </li>
          </ul>
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
    </div>
  );
}
