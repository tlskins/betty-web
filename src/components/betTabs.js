import React, { useState } from "react";
import { Redirect } from "@reach/router";
import "typeface-roboto";

import { Bet } from "../components/bets/bet";

export function BetTabs({
  profile,
  acceptedBets,
  finalBets,
  publicPendingBets,
  pendingBets,
  rejectedBets
}) {
  const [redirectTo, setRedirectTo] = useState(undefined);
  const [tab, setTab] = useState("Public");
  const [search, setSearch] = useState("");

  const onRedirectBet = id => () => {
    setRedirectTo("/bet/" + id);
  };

  let bets = [];
  switch (tab) {
    case "Public":
      bets = publicPendingBets;
      break;
    case "Accepted":
      bets = acceptedBets;
      break;
    case "Final":
      bets = finalBets;
      break;
    case "Pending":
      bets = pendingBets;
      break;
    case "Rejected":
      bets = rejectedBets;
      break;
    default:
      break;
  }
  if (search.length > 0) {
    bets = searchBets(bets, search);
  }

  const publicBd = tab === "Public" && "border-b-2";
  const acceptBd = tab === "Accepted" && "border-b-2";
  const finalBd = tab === "Final" && "border-b-2";
  const pendingBd = tab === "Pending" && "border-b-2";
  const rejectedBd = tab === "Rejected" && "border-b-2";

  return (
    <div className="page-section items-center content-center justify-center flex flex-col">
      <div className="w-full">
        <div className="bg-white px-8 pt-2 shadow-md">
          <div className="-mb-px p-1 lg:flex justify-center font-sans overflow-x-auto">
            <div
              className={`cursor-pointer text-teal-700 ${publicBd} border-teal-700 rounded-t uppercase tracking-wider font-bold text-xs py-3 px-2 mr-8 hover:bg-teal-300`}
              onClick={() => setTab("Public")}
            >
              Public
            </div>
            <div
              className={`cursor-pointer text-teal-700 ${acceptBd} border-teal-700 rounded-t uppercase tracking-wider font-bold text-xs py-3 px-2 mr-8 hover:bg-teal-300`}
              onClick={() => setTab("Accepted")}
            >
              Accepted
            </div>
            {pendingBets && (
              <div
                className={`cursor-pointer text-teal-700 ${pendingBd} border-teal-700 rounded-t uppercase tracking-wider font-bold text-xs py-3 px-2 mr-8 hover:bg-teal-300`}
                onClick={() => setTab("Pending")}
              >
                Pending
              </div>
            )}
            <div
              className={`cursor-pointer text-teal-700 ${finalBd} border-teal-700 rounded-t uppercase tracking-wider font-bold text-xs py-3 px-2 mr-8 hover:bg-teal-300`}
              onClick={() => setTab("Final")}
            >
              Final
            </div>
            {rejectedBets && (
              <div
                className={`cursor-pointer text-teal-700 ${rejectedBd} border-teal-700 rounded-t uppercase tracking-wider font-bold text-xs py-3 px-2 mr-8 hover:bg-teal-300`}
                onClick={() => setTab("Rejected")}
              >
                Rejected
              </div>
            )}
          </div>
        </div>

        <BetSearch search={search} setSearch={setSearch} />

        <div>
          {bets.map((bet, idx) => (
            <Bet
              key={idx}
              bet={bet}
              onClick={onRedirectBet(bet.id)}
              profile={profile}
            />
          ))}
          {bets.length === 0 && (
            <div className="w-full p-8 items-center content-center justify-center text-center shadow-md">
              No Bets
            </div>
          )}
          {redirectTo && <Redirect to={redirectTo} noThrow />}
        </div>
      </div>
    </div>
  );
}

export function BetSearch({ search, setSearch }) {
  return (
    <div className="-mb-px p-1 lg:flex items-center content-center justify-center font-sans overflow-x-auto shadow-md bg-white">
      <div className="text-gray-600 px-8 mt-2">
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

function searchBets(bets, search) {
  const rgx = new RegExp(search, "i");
  return bets.filter(bet => {
    const proposer =
      rgx.test(bet.proposer.name) ||
      rgx.test(bet.proposer.userName) ||
      rgx.test(bet.proposer.twitterUser?.screenName);

    const recipient =
      rgx.test(bet.recipient?.name) ||
      rgx.test(bet.recipient?.userName) ||
      rgx.test(bet.recipient?.twitterUser?.screenName);

    const player = bet.equations.some(eq => {
      return eq.expressions.some(expr => {
        return (
          rgx.test(expr.player?.name) ||
          rgx.test(expr.player?.position) ||
          rgx.test(expr.player?.teamFk) ||
          rgx.test(expr.player?.teamName) ||
          rgx.test(expr.player?.leagueId)
        );
      });
    });

    const team = bet.equations.some(eq => {
      return eq.expressions.some(expr => {
        return (
          rgx.test(expr.team?.name) ||
          rgx.test(expr.team?.location) ||
          rgx.test(expr.team?.teamFk) ||
          rgx.test(expr.team?.leagueId)
        );
      });
    });

    return proposer || recipient || player || team;
  });
}

// export const SEARCH_BETS = gql`
//   query searchBets($search: String!, $userId: String, $betStatus: String) {
//     searchBets(search: $search, userId: $userId, betStatus: $betStatus) {
//       ...BetDetail
//     }
//   }
//   ${BetFrags.fragments.bet}
// `;
