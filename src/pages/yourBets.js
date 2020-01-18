import React, { useState } from "react";
import { useQuery } from "@apollo/react-hooks";
import { Redirect } from "@reach/router";
import gql from "graphql-tag";
import "typeface-roboto";

import { CurrentGames } from "./currentGames";
import { NavBar } from "./navBar";
import { RotoSideBar } from "./rotoSideBar";
import { NewBet, Bet } from "./bets/bet";
import { RotoAlerts } from "./rotoAlerts";
import { FilterButton } from "./components/filterButton";

export const GET_BETS = gql`
  query bets {
    bets {
      id
      createdAt
      finalizedAt
      expiresAt
      betStatus
      proposer {
        id
        name
        userName
      }
      recipient {
        id
        name
        userName
      }
      equations {
        id
        operator {
          id
          name
        }
        expressions {
          id
          isLeft
          player {
            teamFk
            firstName
            lastName
            teamShort
            position
          }
          game {
            homeTeamFk
            homeTeamName
            awayTeamName
          }
          metric {
            name
          }
        }
      }
    }
  }
`;

export const GET_SETTINGS = gql`
  query getSettings($id: String!) {
    leagueSettings(id: $id) {
      __typename
      id
      currentYear
      currentWeek
      playerBets {
        id
        name
      }
      teamBets {
        id
        name
      }
      betEquations {
        id
        name
      }
    }
  }
`;

export function YourBets() {
  const [showSideBar, setShowSideBar] = useState(undefined);
  const [redirectToBet, setRedirectToBet] = useState(undefined);
  useQuery(GET_SETTINGS, {
    variables: { id: "nfl" }
  });
  const { loading, error, data } = useQuery(GET_BETS);
  console.log("your bets data", loading, error, data);

  const onRedirectBet = id => () => {
    setRedirectToBet(id);
  };

  return (
    <div className="page-layout-wrapper">
      <NavBar clickRotoNfl={() => setShowSideBar("RotoNfl")} />
      <RotoSideBar
        show={showSideBar == "RotoNfl"}
        hide={() => setShowSideBar(undefined)}
      />
      <RotoAlerts />
      <div className="page-layout">
        <div className="page-inner-layout">
        <div className="page-wrapper my-10">
            <div className="page-content">
              <div className="page-content-area">
                <div className="page-section">
                  <CurrentGames />
                </div>
              </div>
            </div>
          </div>
          <div className="page-wrapper my-10">
            <div className="page-content">
              <div className="page-content-area">
                <div className="page-section">
                  <NewBet />
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
              <div className="page-content-area">
                <div className="page-section">
                  {data &&
                    data.bets &&
                    data.bets.map((bet, idx) => (
                      <div key={idx}>
                        <Bet bet={bet} onClick={onRedirectBet(bet.id)} />
                        {redirectToBet == bet.id && (
                          <Redirect to={`/bet/${bet.id}`} noThrow />
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}