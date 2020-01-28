import React, { useState } from "react";
import { useQuery } from "@apollo/react-hooks";
import { Redirect } from "@reach/router";
import "typeface-roboto";
import gql from "graphql-tag";

import { CurrentGames } from "../components/currentGames";
import { NavBar } from "../components/navBar";
import { RotoSideBar } from "../components/rotoSideBar";
import { ProfileSideBar } from "../components/profileSideBar";
import { Bet } from "../components/bets/bet";
import { UserAlerts } from "../components/userAlerts";
import { FilterButton } from "../components/filterButton";

export const BROWSE_BETS = gql`
  query {
    currentBets {
      id
      createdAt
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

export function BrowseBets() {
  const [showSideBar, setShowSideBar] = useState(undefined);
  const [redirectTo, setRedirectTo] = useState(undefined);
  const { data } = useQuery(BROWSE_BETS);

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
        show={showSideBar === "roto"}
        hide={() => setShowSideBar(undefined)}
      />
      <ProfileSideBar
        show={showSideBar === "profile"}
        hide={() => setShowSideBar(undefined)}
      />
      <UserAlerts />
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
              <div className="page-content-area">
                <div className="page-section">
                  {data &&
                    data.currentBets &&
                    data.currentBets.map((bet, idx) => (
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
