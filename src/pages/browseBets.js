import React from "react";
import { useQuery } from "@apollo/react-hooks";
import "typeface-roboto";
import gql from "graphql-tag";

import { BetTabs } from "../components/betTabs";
import { LeaderBoardTabs } from "../components/leaderBoardsTab";
import BetFrags from "../fragments/bet";

export function BrowseBets({ profile }) {
  const { data: betData } = useQuery(BROWSE_BETS);
  const { data: leaderData } = useQuery(CURRENT_LEADERBOARDS);

  console.log(leaderData);

  const publicBets = betData?.currentBets?.publicPendingBets || [];
  const finalBets = betData?.currentBets?.finalBets || [];
  const acceptedBets = betData?.currentBets?.acceptedBets || [];

  const leaderBaords = leaderData?.currentLeaderBoards || [];

  return (
    <div className="page-layout-wrapper">
      <div className="page-layout">
        <div className="w-full">
          <div className="page-hdr-box">
            <h3 className="page-hdr">Leader Board</h3>
          </div>
          <div className="page-wrapper">
            <div className="page-content">
              <div className="page-content-area flex flex-col items-center content-center justify-center p-8">
                <LeaderBoardTabs leaderBoards={leaderBaords} />
              </div>
            </div>
          </div>

          <div className="page-hdr-box">
            <h3 className="page-hdr">Current Bets</h3>
          </div>
          <div className="page-wrapper">
            <div className="page-content">
              <div className="page-content-area flex flex-col items-center content-center justify-center">
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

export const CURRENT_LEADERBOARDS = gql`
  query {
    currentLeaderBoards {
      id
      leagueId
      startTime
      endTime
      final
      leaders {
        rank
        score
        wins
        losses
        wonBets
        lostBets
        user {
          id
          name
          userName
          twitterUser {
            screenName
            name
          }
        }
      }
    }
  }
`;
