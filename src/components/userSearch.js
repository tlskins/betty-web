import React, { useState } from "react";
import { useLazyQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { useThrottle } from "../utils";
import { ExitButton } from "./exitButton";

var publicBetOption = { id: "-1", userName: "*Public Bet" };

export function UserSearch({ value, onSelect, onClear }) {
  let [execute, { data }] = useLazyQuery(FIND_USERS);
  const [searchIdx, setSearchIdx] = useState(0);
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const onSearch = useThrottle(execute, 300);

  let users = data?.findUsers || [];
  if (search?.charAt(0) === "@") {
    users = [{ twitterUser: { screenName: search.replace("@", "") } }].concat(
      users
    );
  } else {
    users = [publicBetOption].concat(users);
  }

  const onChange = e => {
    const txt = e.target.value;
    onSearch({ variables: { search: txt.replace("@", "") } });
    setSearch(txt);
  };

  const onKeyDown = e => {
    if (e.keyCode === 27) {
      onSearchExit(); // esc
    } else if (users.length > 0) {
      if (e.keyCode === 13) {
        onSelect({ user: users[searchIdx] });
        onSearchExit(); // enter
      } else if (e.keyCode === 40) {
        const idx = searchIdx === 0 ? users.length - 1 : searchIdx - 1;
        setSearchIdx(idx); // down
      } else if (e.keyCode === 38) {
        const idx = searchIdx === users.length - 1 ? 0 : searchIdx + 1;
        setSearchIdx(idx); // up
      }
    }
  };

  const selectUser = user => () => {
    onSelect({ user });
    onSearchExit();
  };

  const onSearchExit = () => {
    setSearch("");
    setShowDropdown(false);
  };

  return (
    <div className="dropdown-menu flex flex-row">
      <div className="dropdown-btn relative">
        <ExitButton
          onClick={() => {
            onSearchExit();
            onClear();
          }}
        />
        <div className="dropdown-selection">
          <input
            disabled={!!value}
            value={search || value}
            type="text"
            placeholder="user or @twitter_handle"
            className="p-2 text-sm"
            onChange={onChange}
            onKeyDown={onKeyDown}
            onFocus={() => setShowDropdown(true)}
          />
        </div>
        {showDropdown && (
          <ul className="dropdown-list">
            {users.map((user, idx) => (
              <UserCard
                key={idx}
                user={user}
                searchIdx={searchIdx}
                idx={idx}
                selectUser={selectUser}
                setSearchIdx={setSearchIdx}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function UserCard({ user, searchIdx, idx, selectUser, setSearchIdx }) {
  const { id, userName, twitterUser = {} } = user;
  const { screenName } = twitterUser;

  const bkgCol = id === "-1" ? "bg-indigo-" : "bg-gray-";
  const bkgDrk = searchIdx === idx ? "800" : "200";
  const bkg = bkgCol + bkgDrk;
  const fontCol = searchIdx === idx ? "text-white" : "text-black";

  let title = "*No betty account";
  if (id === "-1") {
    title = user.userName;
  } else {
    title = `${userName} (betty)`;
  }

  return (
    <div
      className={`dropdown-list-item ${bkg} ${fontCol}`}
      onClick={selectUser(user)}
      onMouseEnter={() => setSearchIdx(idx)}
    >
      <div className="dropdown-list-item-text font-semibold flex flex-row">
        <div className="flex flex-col">
          {title}
          <br />
          {screenName && `Twitter: @${screenName.replace("@", "")}`}
        </div>
      </div>
    </div>
  );
}

export const FIND_USERS = gql`
  query findUsers($search: String!) {
    findUsers(search: $search) {
      id
      userName
      name
      twitterUser {
        idStr
        screenName
        name
      }
    }
  }
`;
