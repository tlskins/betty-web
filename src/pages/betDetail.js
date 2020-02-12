import React, { useState } from "react";
import { useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";
import "typeface-roboto";

import { Bet } from "../components/bets/bet";
import { RegistrationDetails } from "./signIn";

export function BetDetail({ profile, setAlertMsg, betId }) {
  const { data } = useQuery(GET_BET, {
    variables: { id: betId }
  });
  const [registration, setRegistration] = useState(false);
  const signedIn = !!(profile && profile.id);
  const bet = data?.bet;

  return (
    <div className="page-layout-wrapper">
      <div className="page-layout">
        <div className="w-full lg:w-3/4">
          <div className="page-hdr-box">
            <h3 className="page-hdr">Bet</h3>
          </div>
          <div className="page-wrapper">
            <div className="page-content">
              <div className="page-content-area flex justify-center">
                <div className="page-section flex flex-col">
                  {!signedIn && (
                    <div className="text-center font-serif inline-block bg-indigo-200 rounded p-2 my-4 w-3/4 lg:w-1/2 self-center mb-6">
                      Is this your bet?
                      <br /> Reply "Yes / No" to the tweet!
                      <div
                        className="underline text-blue-500 hover:text-blue-800 cursor-pointer"
                        onClick={() => setRegistration(!registration)}
                      >
                        New user?
                      </div>
                    </div>
                  )}
                  <div>{registration && <RegistrationDetails />}</div>
                  {bet && (
                    <Bet
                      bet={bet}
                      setAlertMsg={setAlertMsg}
                      profile={profile}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const GET_BET = gql`
  query bet($id: ID!) {
    bet(id: $id) {
      id
      createdAt
      finalizedAt
      expiresAt
      betStatus
      proposerReplyFk
      recipientReplyFk
      proposer {
        id
        name
        userName
        twitterUser {
          screenName
        }
      }
      recipient {
        id
        name
        userName
        twitterUser {
          screenName
        }
      }
      betResult {
        response
        responseFk
        decidedAt
        winner {
          name
          userName
          getName
        }
        loser {
          name
          userName
          getName
        }
      }
      equations {
        id
        operator {
          id
          name
        }
        expressions {
          ... on StaticExpression {
            id
            isLeft
            value
          }
          ... on PlayerExpression {
            id
            isLeft
            value
            player {
              id
              teamFk
              leagueId
              firstName
              lastName
              position
              updatedAt
            }
            game {
              id
              homeTeamFk
              homeTeamName
              awayTeamName
            }
            metric {
              name
              leftOnly
            }
          }
          ... on TeamExpression {
            isLeft
            value
            team {
              id
              leagueId
              fk
              name
              url
              updatedAt
              location
            }
            game {
              id
              homeTeamFk
              homeTeamName
              awayTeamName
            }
            metric {
              name
              leftOnly
              rightExpressionValue
            }
          }
        }
      }
    }
  }
`;
