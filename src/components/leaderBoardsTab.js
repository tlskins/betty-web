import React, { useState } from "react";
import { Redirect } from "@reach/router";
import "typeface-roboto";

import { TrophyIcon } from "./trophyIcon";
import { toMoment } from "../utils";

export function LeaderBoardTabs({ leaderBoards }) {
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState("");
  const [redirectTo, setRedirectTo] = useState(undefined);

  const onRedirectUser = id => () => {
    setRedirectTo("/users/" + id);
  };

  let leaderBoard;
  switch (tab) {
    case 0:
      leaderBoard = leaderBoards[0];
      break;
    case 1:
      leaderBoard = leaderBoards[1];
      break;
    case 2:
      leaderBoard = leaderBoards[2];
      break;
    default:
      break;
  }

  const oneWeek = leaderBoards.length > 1;
  const twoWeek = leaderBoards.length > 2;

  let leaders = leaderBoard?.leaders || [];
  if (search.length > 0) {
    leaders = searchLeaders(leaders, search);
  }

  const currentBd = tab === 0 && "border-b-2";
  const oneBd = tab === 1 && "border-b-2";
  const twoBd = tab === 2 && "border-b-2";

  return (
    <div className="page-section items-center content-center justify-center flex flex-col">
      <div className="w-full">
        <div className="bg-white px-8 pt-2 shadow-md">
          <div className="-mb-px p-1 lg:flex justify-center font-sans overflow-x-auto">
            <div
              className={`cursor-pointer text-teal-700 ${currentBd} border-teal-700 rounded-t uppercase tracking-wider font-bold text-xs py-3 px-2 mr-8 hover:bg-teal-300`}
              onClick={() => setTab(0)}
            >
              Current
            </div>
            {oneWeek && (
              <div
                className={`cursor-pointer text-teal-700 ${oneBd} border-teal-700 rounded-t uppercase tracking-wider font-bold text-xs py-3 px-2 mr-8 hover:bg-teal-300`}
                onClick={() => setTab(1)}
              >
                {toMoment(leaderBoards[1].startTime).format("MMM Do")}
              </div>
            )}
            {twoWeek && (
              <div
                className={`cursor-pointer text-teal-700 ${twoBd} border-teal-700 rounded-t uppercase tracking-wider font-bold text-xs py-3 px-2 mr-8 hover:bg-teal-300`}
                onClick={() => setTab(2)}
              >
                {toMoment(leaderBoards[2].startTime).format("MMM Do")}
              </div>
            )}
          </div>
        </div>

        <LeaderSearch search={search} setSearch={setSearch} />

        <div className="-mb-px p-1 flex flex-col font-sans overflow-x-auto shadow-md bg-white">
          {leaders.map((leader, idx) => {
            const { rank, wins, losses, user } = leader;
            const { id, name, userName } = user;
            return (
              <div
                key={idx}
                className="rounded-lg border-gray-500 mt-6 px-4 py-6 shadow-xl hover:bg-gray-100 cursor-pointer items-center content-center justify-center"
                onClick={onRedirectUser(id)}
              >
                <div className="flex items-center content-center justify-center">
                  <div>
                    <div className="mx-4 font-bold tracking-wider uppercase text-teal-700 flex items-center content-center justify-center text-center">
                      {rank === 1 ? (
                        <TrophyIcon />
                      ) : (
                        <span className="bg-teal-700 text-white py-1 px-4 my-2 rounded">{`Rank ${rank}`}</span>
                      )}
                    </div>
                    <div className="w-full text-teal-700 text-center text-sm">
                      <div>{`${userName} (${name}) `}</div>
                      <div className="font-bold uppercase">
                        {`Wins (${wins}) | Losses (${losses})`}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {leaderBoard?.leaders?.length === 0 && (
            <div className="w-full p-8 items-center content-center justify-center text-center shadow-md">
              No Leaders
            </div>
          )}
          {redirectTo && <Redirect to={redirectTo} noThrow />}
        </div>
      </div>
    </div>
  );
}

function LeaderSearch({ search, setSearch }) {
  return (
    <div className="-mb-px p-1 lg:flex items-center content-center justify-center font-sans overflow-x-auto shadow-md bg-white">
      <div className="text-gray-600 flex items-center content-center justify-center">
        <input
          type="search"
          value={search}
          name="search"
          placeholder="Search"
          className="bg-white h-10 px-5 pr-10 rounded-full text-sm focus:outline-none bg-gray-200"
          onChange={e => setSearch(e.target.value)}
        />
        <button type="submit" className="ml-3">
          <svg
            className="h-4 w-4 fill-current"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            version="1.1"
            id="Capa_1"
            x="0px"
            y="0px"
            viewBox="0 0 56.966 56.966"
            xmlSpace="preserve"
            width="512px"
            height="512px"
          >
            <path d="M55.146,51.887L41.588,37.786c3.486-4.144,5.396-9.358,5.396-14.786c0-12.682-10.318-23-23-23s-23,10.318-23,23  s10.318,23,23,23c4.761,0,9.298-1.436,13.177-4.162l13.661,14.208c0.571,0.593,1.339,0.92,2.162,0.92  c0.779,0,1.518-0.297,2.079-0.837C56.255,54.982,56.293,53.08,55.146,51.887z M23.984,6c9.374,0,17,7.626,17,17s-7.626,17-17,17  s-17-7.626-17-17S14.61,6,23.984,6z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function searchLeaders(leaders, search) {
  const rgx = new RegExp(search, "i");
  return leaders.filter(ldr => {
    return (
      rgx.test(ldr.user.name) ||
      rgx.test(ldr.user.userName) ||
      rgx.test(ldr.user.twitterUser?.screenName) ||
      rgx.test(ldr.user.twitterUser?.name)
    );
  });
}
