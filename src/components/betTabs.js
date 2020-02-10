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
          <div
            className="-mb-px p-1 lg:flex justify-center font-sans overflow-x-auto"
            style={{ transition: `all 600ms ease 0s` }}
          >
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