import React, { useState } from "react";
import { useQuery } from "@apollo/react-hooks";
import { Redirect } from "@reach/router";
import gql from "graphql-tag";
import "typeface-roboto";

import { CurrentGames } from "../components/currentGames";
import { Bet } from "../components/bets/bet";
import { NewBet } from "../components/bets/newBet";
import { FilterButton } from "../components/filterButton";
import BetFrags from "../fragments/bet";

export function YourBets({ profile, setAlertMsg }) {
  const [redirectTo, setRedirectTo] = useState(undefined);
  const { error, data } = useQuery(GET_BETS);

  if (error) {
    return <Redirect to="/" noThrow />;
  }

  const onRedirectBet = id => () => {
    setRedirectTo("/bet/" + id);
  };

  return (
    <div className="page-layout-wrapper">
      <div className="page-layout">
        <div className="w-full">
          <div className="page-wrapper flex mt-8 items-center content-center justify-center">
            <NewBet setAlertMsg={setAlertMsg} />
          </div>
          <div className="page-wrapper my-24">
            <div className="page-content">
              <div className="page-content-area flex justify-center">
                <div className="page-section">
                  <CurrentGames />
                </div>
              </div>
            </div>
          </div>
          <div className="page-hdr-box">
            <h3 className="page-hdr">Your Bets</h3>
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
                    data.bets &&
                    data.bets.map((bet, idx) => (
                      <div key={idx} className="my-20">
                        <Bet
                          bet={bet}
                          profile={profile}
                          onClick={onRedirectBet(bet.id)}
                          setAlertMsg={setAlertMsg}
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

export const GET_BETS = gql`
  query bets {
    bets {
      ...BetDetail
    }
  }
  ${BetFrags.fragments.bet}
`;
