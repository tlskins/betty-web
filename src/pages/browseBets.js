import React, { useState } from "react";
import { useQuery } from "@apollo/react-hooks";
import { Redirect } from "@reach/router";
import "typeface-roboto";
import gql from "graphql-tag";

import { CurrentGames } from "../components/currentGames";
import { Bet } from "../components/bets/bet";
import { FilterButton } from "../components/filterButton";
import BetFrags from "../fragments/bet";

export function BrowseBets({ profile }) {
  const [redirectTo, setRedirectTo] = useState(undefined);
  const { data } = useQuery(BROWSE_BETS);

  const onRedirectBet = id => () => {
    setRedirectTo("/bet/" + id);
  };

  return (
    <div className="page-layout-wrapper">
      <div className="page-layout">
        <div className="w-full">
          <div className="page-wrapper my-10">
            <div className="page-content">
              <div className="page-content-area flex justify-center">
                <div className="page-section">
                  <CurrentGames />
                </div>
              </div>
            </div>
          </div>
          <div className="page-hdr-box">
            <h3 className="page-hdr">Current Bets</h3>
          </div>
          <div className="page-wrapper">
            <div className="page-summary">
              <div className="page-summary-item">
                <div className="flex-row">
                  <FilterButton />
                </div>
              </div>
            </div>
            <div className="page-content">
              <div className="page-content-area flex justify-center">
                <div className="page-section">
                  {data &&
                    data.currentBets &&
                    data.currentBets.map((bet, idx) => (
                      <div key={idx}>
                        <Bet
                          bet={bet}
                          onClick={onRedirectBet(bet.id)}
                          profile={profile}
                        />
                      </div>
                    ))}
                  {redirectTo && <Redirect to={redirectTo} noThrow />}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const BROWSE_BETS = gql`
  query {
    currentBets {
      ...BetDetail
    }
  }
  ${BetFrags.fragments.bet}
`;
