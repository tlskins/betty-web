import React, { useState } from "react";
import { useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";
import "typeface-roboto";

import { NavBar } from "./navBar";
// import { NavSideBar } from "./navSideBar";
import { RotoSideBar } from "./rotoSideBar";
import { Bet } from "./bet";
import { NewBet } from "./newBet";
import { RotoAlerts } from "./rotoAlerts";

export const GET_BETS = gql`
  query {
    bets {
      id
      createdAt
      proposer {
        name
        screenName
      }
      recipient {
        name
        screenName
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
            fk
            name
          }
          game {
            fk
            name
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
  useQuery(GET_SETTINGS, {
    variables: { id: "nfl" }
  });
  const { loading: betsLoading, error: betsErr, data: betsData } = useQuery(
    GET_BETS
  );

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
          <div className="page-hdr-box">
            <h3 className="page-hdr">New Bet</h3>
          </div>
          <div className="page-wrapper">
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
                  <label className="collapse-toggle">
                    <span className="toggle-name">SHOW FILTERS</span>
                    <svg
                      data-name="Layer 1"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 8.33 5"
                      width="10px"
                      height="10px"
                      className="arrow pointer "
                      style={{ transform: `rotate(-270deg)` }}
                    >
                      <polyline
                        points="1.17 4.25 4.17 1.25 7.17 4.25"
                        fill="none"
                        stroke="#0b0b0b"
                        strokeMiterlimit="10"
                        strokeWidth="1.5"
                      ></polyline>
                    </svg>
                  </label>
                </div>
              </div>
            </div>
            <div className="page-content">
              <div className="page-content-area">
                <div className="page-section">
                  {betsData &&
                    betsData.bets &&
                    betsData.bets.map((bet, idx) => (
                      <div key={idx}>
                        <Bet bet={bet} />
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
