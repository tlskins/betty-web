import React, { useState, useEffect, Fragment } from "react";
import { useQuery, useSubscription } from "@apollo/react-hooks";
import gql from "graphql-tag";
import "typeface-roboto";
import { makeStyles } from "@material-ui/core/styles";
import FormControl from "@material-ui/core/FormControl";
import NativeSelect from "@material-ui/core/NativeSelect";
import Chip from "@material-ui/core/Chip";
import FaceIcon from "@material-ui/icons/Face";

import { NavBar } from "./navBar";
import { NavSideBar } from "./navSideBar";
import { Bet } from "./bet";
import { RotoAlerts } from "./rotoAlerts";

export const GET_BETS = gql`
  query {
    bets {
      id
      sourceFk
      proposer {
        idStr
        name
        screenName
      }
      recipient {
        idStr
        name
        screenName
      }
      acceptFk
      proposerReplyFk
      recipientReplyFk
      expiresAt
      finalizedAt
      equations {
        operator {
          name
        }
        result
        leftExpressions {
          value
          metric {
            name
          }
          player {
            name
            firstName
            lastName
            position
            fk
            teamFk
            teamName
            teamShort
            url
          }
          game {
            name
            fk
            url
            awayTeamFk
            awayTeamName
            homeTeamFk
            homeTeamName
            gameTime
            gameResultsAt
            final
          }
        }
        rightExpressions {
          value
          metric {
            name
          }
          player {
            name
            firstName
            lastName
            position
            fk
            teamFk
            teamName
            teamShort
            url
          }
          game {
            name
            fk
            url
            awayTeamFk
            awayTeamName
            homeTeamFk
            homeTeamName
            gameTime
            gameResultsAt
            final
          }
        }
      }
      betStatus
      betResult {
        response
        decidedAt
        responseFk
        winner {
          idStr
          name
          screenName
        }
        loser {
          idStr
          name
          screenName
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
        name
      }
      teamBets {
        name
      }
      betEquations {
        name
      }
    }
  }
`;

const steps = [
  { num: 0, name: "Choose Player / Team" },
  { num: 1, name: "Choose Stat / Result" },
  { num: 2, name: "Choose Comparison Type" },
  { num: 3, name: "Choose Player / Team" },
  { num: 4, name: "Choose Stat / Result" }
];

export function Equation({ equation, id }) {
  const renderExpr = (expr, key) => {
    if (typeof expr == "string") {
      return (
        <Chip
          key={key}
          color="secondary"
          onDelete={() => {}}
          icon={<FaceIcon />}
          label={expr}
        />
      );
    } else {
      return (
        <Chip
          key={key}
          color="primary"
          onDelete={() => {}}
          icon={<FaceIcon />}
          label={expr.name}
        />
      );
    }
  };

  return <div id={id}>{equation.map((e, i) => renderExpr(e, i))}</div>;
}

const useStyles = makeStyles(theme => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120
  },
  selectEmpty: {
    marginTop: theme.spacing(2)
  }
}));

export function YourBets() {
  const [showSideBar, setShowSideBar] = useState(false);
  useQuery(GET_SETTINGS, {
    variables: { id: "nfl" }
  });
  const { loading: betsLoading, error: betsErr, data: betsData } = useQuery(
    GET_BETS
  );

  return (
    <div className="page-layout-wrapper">
      <NavBar clickMenu={() => setShowSideBar(!showSideBar)} />
      <NavSideBar show={showSideBar} hide={() => setShowSideBar(false)} />
      <RotoAlerts />
      <div className="page-layout">
        <div className="page-inner-layout">
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
                    betsData.bets.map(bet => <Bet bet={bet} />)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
