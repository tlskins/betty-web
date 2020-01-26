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

export function UserSearch({ onExit, onSelect }) {
  let [execute, { data }] = useLazyQuery(FIND_USERS);
  const [searchIdx, setSearchIdx] = useState(0);
  const [search, setSearch] = useState("");
  const onSearch = useThrottle(execute, 300);

  let users = (data && data.findUsers) || [];
  if (search && search.charAt(0) === "@") {
    users = [{ twitterUser: { screenName: search.replace("@", "") } }].concat(
      users
    );
  }

  const onChange = e => {
    let { value } = e.target;
    if (value.length == 0) return;
    onSearch({ variables: { search: value.replace("@", "") } });
    setSearch(value);
  };

  const onKeyDown = e => {
    if (e.keyCode == 27) {
      onExit(); // esc
    } else if (users.length > 0) {
      if (e.keyCode === 13) {
        onSelect({ user: users[searchIdx] });
        onExit(); // enter
      } else if (e.keyCode === 40) {
        const idx = searchIdx == 0 ? users.length - 1 : searchIdx - 1;
        setSearchIdx(idx); // down
      } else if (e.keyCode === 38) {
        const idx = searchIdx == users.length - 1 ? 0 : searchIdx + 1;
        setSearchIdx(idx); // up
      }
    }
  };

  return (
    <div className="dropdown-menu flex flex-row">
      <button className="dropdown-btn">
        <ExitButton onClick={onExit} />
        <div className="dropdown-title ml-2">User</div>
        <div className="dropdown-selection">
          <input
            type="text"
            autoFocus={true}
            placeholder="search"
            className="p-2"
            onChange={onChange}
            onKeyDown={onKeyDown}
          />
        </div>
        <ul className="dropdown-list">
          {users.map((user, i) => {
            const { id, userName, twitterUser = {} } = user;
            const { screenName } = twitterUser;
            const className =
              searchIdx == i
                ? "dropdown-list-item bg-gray-200"
                : "dropdown-list-item";
            return (
              <div
                key={id + i}
                className={className}
                onClick={() => {
                  onSelect({ user });
                  onExit();
                }}
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
      </button>
    </div>
  );
}
