import React, { useState } from "react";
import { useQuery } from "@apollo/react-hooks";
import { Redirect } from "@reach/router";
import "typeface-roboto";
import gql from "graphql-tag";

import { CurrentGames } from "../components/currentGames";
import { Bet } from "../components/bets/bet";
import { FilterButton } from "../components/filterButton";

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
      id
      createdAt
      finalizedAt
      expiresAt
      betStatus
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
