import React from "react";
import { useQuery } from "@apollo/react-hooks";
import "typeface-roboto";
import gql from "graphql-tag";

import { CurrentGames } from "../components/currentGames";
import { BetTabs } from "../components/betTabs";
import BetFrags from "../fragments/bet";

export function BrowseBets({ profile }) {
  const { data } = useQuery(BROWSE_BETS);

  const publicBets = data?.currentBets?.publicPendingBets || [];
  const finalBets = data?.currentBets?.finalBets || [];
  const acceptedBets = data?.currentBets?.acceptedBets || [];

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
            <div className="page-content">
              <div className="page-content-area flex items-center content-center justify-center">
                <BetTabs
                  profile={profile}
                  acceptedBets={acceptedBets}
                  finalBets={finalBets}
                  publicPendingBets={publicBets}
                />
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
      acceptedBets {
        ...BetDetail
      }
      finalBets {
        ...BetDetail
      }
      publicPendingBets {
        ...BetDetail
      }
    }
  }
  ${BetFrags.fragments.bet}
`;
