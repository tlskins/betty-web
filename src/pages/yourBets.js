import React, { useState } from "react";
import { useQuery } from "@apollo/react-hooks";
import { Redirect } from "@reach/router";
import gql from "graphql-tag";
import "typeface-roboto";

import { CurrentGames } from "../components/currentGames";
import { Bet } from "../components/bets/bet";
import { NewBet } from "../components/bets/newBet";
import { FilterButton } from "../components/filterButton";

export const GET_BETS = gql`
  query bets {
    bets {
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
            }
          }
        }
      }
    }
  }
`;

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
        <div className="page-inner-layout">
          <div className="page-wrapper my-10">
            <div className="page-content">
              <div className="page-content-area flex justify-center">
                <div className="page-section m-12 bg-gray-300 rounded p-8 shadow-2xl">
                  <NewBet setAlertMsg={setAlertMsg} />
                </div>
              </div>
            </div>
          </div>
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
