import React from "react";
import { useQuery } from "@apollo/react-hooks";
import { Redirect } from "@reach/router";
import gql from "graphql-tag";
import "typeface-roboto";

import { CurrentGames } from "../components/currentGames";
import { BetTabs } from "../components/betTabs";
import { NewBet } from "../components/bets/newBet";
import BetFrags from "../fragments/bet";

export function YourBets({ profile, setAlertMsg }) {
  const { error, data } = useQuery(GET_BETS);

  if (error) {
    return <Redirect to="/" noThrow />;
  }

  const publicBets = data?.bets?.publicPendingBets || [];
  const finalBets = data?.bets?.finalBets || [];
  const acceptedBets = data?.bets?.acceptedBets || [];
  const pendingBets = data?.bets?.pendingBets || [];
  const rejectedBets = data?.bets?.closedBets || [];

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
            <div className="page-content">
              <div className="page-content-area flex justify-center">
                <div className="page-content-area flex items-center content-center justify-center">
                  <BetTabs
                    profile={profile}
                    acceptedBets={acceptedBets}
                    finalBets={finalBets}
                    publicPendingBets={publicBets}
                    pendingBets={pendingBets}
                    rejectedBets={rejectedBets}
                  />
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
      acceptedBets {
        ...BetDetail
      }
      finalBets {
        ...BetDetail
      }
      publicPendingBets {
        ...BetDetail
      }
      pendingBets {
        ...BetDetail
      }
      closedBets {
        ...BetDetail
      }
    }
  }
  ${BetFrags.fragments.bet}
`;
