import React, { useState } from "react";
import { useLazyQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { useThrottle } from "../utils";
import { ExitButton } from "./components/exitButton";

export const FIND_USERS = gql`
  query findUsers($search: String!) {
    findUsers(search: $search) {
      __typename
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
  const [execute, { data }] = useLazyQuery(FIND_USERS);
  const [searchIdx, setSearchIdx] = useState(0);
  const onSearch = useThrottle(execute, 300);

  const onChange = e => {
    const search = e.target.value;
    if (search.length == 0) return;
    onSearch({ variables: { search } });
  };

  const onKeyDown = e => {
    if (e.keyCode == 27) {
      // esc
      onExit();
    } else if (
      e.keyCode == 13 &&
      data &&
      data.findUsers &&
      data.findUsers.length > 0
    ) {
      // enter
      onSelect({ user: data.findUsers[searchIdx] });
      onExit();
    } else if (e.keyCode == 40) {
      // down
      const idx = searchIdx == 0 ? data.findUsers.length - 1 : searchIdx - 1;
      setSearchIdx(idx);
    } else if (e.keyCode == 38) {
      // up
      const idx = searchIdx == data.findUsers.length - 1 ? 0 : searchIdx + 1;
      setSearchIdx(idx);
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
        {data && data.findUsers && (
          <ul className="dropdown-list">
            {data.findUsers.map((user, i) => {
              const { id, userName, name, twitterUser = {} } = user;
              const { screenName } = twitterUser;
              const className =
                searchIdx == i
                  ? "dropdown-list-item bg-gray-200"
                  : "dropdown-list-item";
              return (
                <div
                  key={id}
                  className={className}
                  onClick={() => {
                    onSelect({ user });
                    onExit();
                  }}
                  onMouseEnter={() => setSearchIdx(i)}
                >
                  <div className="dropdown-list-item-text flex flex-row">
                    <div className="flex flex-col">
                      {userName} (name)
                      <br />
                      {screenName && `Twitter: ${screenName}`}
                    </div>
                  </div>
                </div>
              );
            })}
          </ul>
        )}
      </button>
    </div>
  );
}
