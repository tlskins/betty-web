import React, { useState } from "react";
import { useQuery } from "@apollo/react-hooks";
import { Helmet } from "react-helmet";
import gql from "graphql-tag";
import "typeface-roboto";

import { NavBar } from "../components/navBar";
import { RotoSideBar } from "../components/rotoSideBar";
import { Bet } from "../components/bets/bet";
import { RotoAlerts } from "../components/rotoAlerts";
import { GET_SETTINGS } from "./yourBets";
import { Alert } from "../components/alert";
import { RegistrationDetails } from "./signIn";

export const GET_BET = gql`
  query bet($id: ID!) {
    bet(id: $id) {
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

export function BetDetail(props) {
  const [showSideBar, setShowSideBar] = useState(undefined);
  useQuery(GET_SETTINGS, {
    variables: { id: "nfl" }
  });
  const { data } = useQuery(GET_BET, {
    variables: { id: props.betId }
  });
  const [alertMsg, setAlertMsg] = useState(undefined);
  const [registration, setRegistration] = useState(false);
  const profile = JSON.parse(localStorage.getItem("profile"));
  const signedIn = !!(profile && profile.id);
  const bet = data && data.bet;
  const proposer =
    bet &&
    ((bet.proposer.twitterUser && bet.proposer.twitterUser.name) ||
      bet.proposer.userName);

  return (
    <div className="page-layout-wrapper">
      <Helmet>
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@bettybetbot" />
        <meta name="twitter:title" content="BettyBets" />
        <meta name="twitter:description" content={`Bet from @${proposer}`} />
        <meta
          name="twitter:image"
          content="https://static01.nyt.com/images/2018/09/06/sports/06helmet-top/06helmet-top-articleLarge.jpg?quality=75&auto=webp&disable=upscale"
        />
      </Helmet>

      <NavBar clickRotoNfl={() => setShowSideBar("roto")} />
      <RotoSideBar
        show={showSideBar === "roto"}
        hide={() => setShowSideBar(undefined)}
      />
      <Alert
        title={alertMsg}
        open={alertMsg !== undefined}
        onClose={() => setAlertMsg(undefined)}
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
                <div className="page-section flex flex-col">
                  {!signedIn && (
                    <div className="text-center font-serif inline-block bg-indigo-200 rounded p-2 w-1/2 self-center mb-6">
                      Is this your bet? Reply "Yes / No" to tweet!
                      <div
                        className="underline text-blue-500 hover:text-blue-800 cursor-pointer"
                        onClick={() => setRegistration(!registration)}
                      >
                        New user?
                      </div>
                    </div>
                  )}
                  <div>{registration && <RegistrationDetails />}</div>
                  {bet && <Bet bet={bet} setAlertMsg={setAlertMsg} />}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
