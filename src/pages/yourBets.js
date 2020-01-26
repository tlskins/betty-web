import React, { useState } from "react";
import { useQuery } from "@apollo/react-hooks";
import { Redirect } from "@reach/router";
import gql from "graphql-tag";
import "typeface-roboto";

import { CurrentGames } from "../components/currentGames";
import { NavBar } from "../components/navBar";
import { RotoSideBar } from "../components/rotoSideBar";
import { ProfileSideBar } from "../components/profileSideBar";
import { NewBet, Bet } from "../components/bets/bet";
import { RotoAlerts } from "../components/rotoAlerts";
import { FilterButton } from "../components/filterButton";

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
  const [redirectTo, setRedirectTo] = useState(undefined);
  useQuery(GET_SETTINGS, {
    variables: { id: "nfl" }
  });
  const { error, data } = useQuery(GET_BETS);

  if (error) {
    return <Redirect to="/" noThrow />;
  }

  const onRedirectBet = id => () => {
    setRedirectTo("/bet/" + id);
  };

  return (
    <div className="page-layout-wrapper">
      <NavBar
        clickRoto={() => setShowSideBar("roto")}
        clickProfile={() => setShowSideBar("profile")}
      />
      <RotoSideBar
        show={showSideBar == "roto"}
        hide={() => setShowSideBar(undefined)}
      />
      <ProfileSideBar
        show={showSideBar == "profile"}
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
