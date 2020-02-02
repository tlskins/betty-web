import React, { useState, useRef, forwardRef, createRef } from "react";
import { useLazyQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { useThrottle } from "../../utils";
import { ExitButton } from "../exitButton";
import { Player, PlayerCard } from "./player";
import { Team, TeamCard } from "./team";

export const SEARCH_SUBJECT = gql`
  query searchSubjects($search: String!) {
    searchSubjects(search: $search) {
      __typename
      ... on Player {
        id
        leagueId
        fk
        name
        url
        updatedAt
        game {
          id
          fk
          name
          week
          awayTeamFk
          awayTeamName
          homeTeamFk
          homeTeamName
          gameTime
          gameResultsAt
          url
        }
        firstName
        lastName
        teamFk
        teamName
        teamShort
        position
      }
      ... on Team {
        id
        leagueId
        fk
        name
        url
        updatedAt
        game {
          id
          fk
          name
          week
          awayTeamFk
          awayTeamName
          homeTeamFk
          homeTeamName
          gameTime
          gameResultsAt
          url
        }
        shortName
        location
      }
    }
  }
`;

export function SubjectSearch({ subject, game, onSelect }) {
  const [searchSubject, { data }] = useLazyQuery(SEARCH_SUBJECT);
  const [searchIdx, setSearchIdx] = useState(0);
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const throttleSearch = useThrottle(searchSubject, 300);
  const cardRefs = useRef(new Array(10).fill(createRef()));
  const subjects = data?.searchSubjects || [];

  const onChange = e => {
    const search = e.target.value;
    setSearch(search);
    throttleSearch({ variables: { search } });
  };

  const onKeyDown = e => {
    if (e.keyCode === 27) {
      onSearchExit(); // esc
    } else if (e.keyCode === 13 && subjects.length > 0) {
      cardRefs.current[searchIdx].current.onClick();
    } else if (e.keyCode === 40) {
      const idx = searchIdx === subjects.length - 1 ? 0 : searchIdx + 1;
      setSearchIdx(idx); // down
    } else if (e.keyCode === 38) {
      const idx = searchIdx === 0 ? subjects.length - 1 : searchIdx - 1;
      setSearchIdx(idx); // up
    }
  };

  const selectSubject = subject => {
    onSelect(subject);
    onSearchExit();
  };

  const onSearchExit = () => {
    setSearch("");
    setShowDropdown(false);
  };

  return (
    <div className="dropdown-menu flex flex-row">
      <button className="dropdown-btn relative">
        <ExitButton
          onClick={() => {
            onSearchExit();
            onSelect({ player: undefined, team: undefined, game: undefined });
          }}
        />
        <div className="dropdown-selection">
          {subject && <Subject subject={subject} game={game} />}
          {!subject && (
            <input
              value={search}
              type="text"
              placeholder="NFL Player / Team"
              className="p-2 mx-5 text-xs"
              onChange={onChange}
              onKeyDown={onKeyDown}
              onFocus={() => setShowDropdown(true)}
            />
          )}
        </div>
        {showDropdown && (
          <ul className="dropdown-list">
            {subjects.map((subject, i) => {
              return (
                <div key={i}>
                  <SubjectCard
                    subject={subject}
                    searchIdx={searchIdx}
                    setSearchIdx={setSearchIdx}
                    index={i}
                    onSelect={selectSubject}
                    ref={cardRefs.current[i]}
                  />
                </div>
              );
            })}
          </ul>
        )}
      </button>
    </div>
  );
}

export function Subject({ subject, game }) {
  if (subject?.__typename === "Player") {
    return <Player player={subject} game={game} />;
  } else if (subject?.__typename === "Team") {
    return <Team team={subject} game={game} />;
  }

  return null;
}

const SubjectCard = forwardRef(
  ({ subject, searchIdx, setSearchIdx, index, onSelect }, ref) => {
    if (subject.__typename === "Player") {
      return (
        <PlayerCard
          player={subject}
          searchIdx={searchIdx}
          setSearchIdx={setSearchIdx}
          index={index}
          onSelect={onSelect}
          ref={ref}
        />
      );
    } else if (subject.__typename === "Team") {
      return (
        <TeamCard
          team={subject}
          searchIdx={searchIdx}
          setSearchIdx={setSearchIdx}
          index={index}
          onSelect={onSelect}
          ref={ref}
        />
      );
    }

    return null;
  }
);
