import React, { useState } from "react";
import { useLazyQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { useThrottle } from "../utils";
import { ExitButton } from "./exitButton";

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

export function UserSearch({ value, onSelect, onClear }) {
  let [execute, { data }] = useLazyQuery(FIND_USERS);
  const [searchIdx, setSearchIdx] = useState(0);
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const onSearch = useThrottle(execute, 300);
  let users = (data && data.findUsers) || [];
  if (search && search.charAt(0) === "@") {
    users = [{ twitterUser: { screenName: search.replace("@", "") } }].concat(
      users
    );
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
            {users.map((user, i) => {
              const { id, userName, twitterUser = {} } = user;
              const { screenName } = twitterUser;
              const className =
                searchIdx === i
                  ? "dropdown-list-item bg-gray-200"
                  : "dropdown-list-item";
              return (
                <div
                  key={id + i}
                  className={className}
                  onClick={selectUser(user)}
                  onMouseEnter={() => setSearchIdx(i)}
                >
                  <div className="dropdown-list-item-text flex flex-row">
                    <div className="flex flex-col">
                      {id ? `${userName} (betty)` : "*No betty account"}
                      <br />
                      {screenName && `Twitter: @${screenName.replace("@", "")}`}
                    </div>
                  </div>
                </div>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
