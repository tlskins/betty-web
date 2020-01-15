import React, { useState } from "react";
import { useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";
import "typeface-roboto";

import { NavBar } from "./navBar";
import { RotoSideBar } from "./rotoSideBar";
import { Bet } from "./bets/bet";
import { RotoAlerts } from "./rotoAlerts";
import { GET_SETTINGS } from "./yourBets";

export const GET_BET = gql`
  query bet($id: ID!) {
    bet(id: $id) {
      id
      createdAt
      betStatus
      proposer {
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

export function BetDetail(props) {
  const [showSideBar, setShowSideBar] = useState(undefined);
  useQuery(GET_SETTINGS, {
    variables: { id: "nfl" }
  });
  const { loading, error, data } = useQuery(GET_BET, {
    variables: { id: props.betId }
  });
  console.log("bet data", props, data);

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
            <h3 className="page-hdr">Bet</h3>
          </div>
          <div className="page-wrapper">
            <div className="page-content">
              <div className="page-content-area">
                <div className="page-section">
                  {data && data.bet && <Bet bet={data.bet} />}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
