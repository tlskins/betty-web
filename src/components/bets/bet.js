import React from "react";
import { useMutation } from "@apollo/react-hooks";
import moment from "moment-timezone";
import gql from "graphql-tag";

import { GET_BETS } from "../../pages/yourBets";
import { Operator } from "./operator";
import { Metric } from "./metric";
import { StaticInput } from "./static";
import { Subject } from "./subject";

export function Bet({ bet, onClick, setAlertMsg, profile }) {
  const {
    id,
    createdAt,
    finalizedAt,
    expiresAt,
    betStatus,
    betResult,
    equations,
    proposer,
    recipient,
    proposerReplyFk,
    recipientReplyFk
  } = bet;
  const isProposer = profile && proposer?.id === profile?.id;
  const isRecipient = profile && recipient?.id === profile?.id;

  const [acceptBet] = useMutation(ACCEPT_BET, {
    onCompleted(data) {
      // setAlertMsg("Bet Accepted!");
    },
    onError(error) {
      setAlertMsg(error.message);
    }
  });
  const [rejectBet] = useMutation(ACCEPT_BET, {
    onCompleted(data) {
      // setAlertMsg(`Bet ${isProposer ? "Withdrawn" : "Declined"}!`);
    },
    onError(error) {
      setAlertMsg(error.message);
    }
  });

  const onAccept = e => {
    e.stopPropagation();
    acceptBet({
      variables: { id, accept: true },
      refetchQueries: [{ query: GET_BETS }]
    });
  };
  const onDecline = e => {
    e.stopPropagation();
    rejectBet({
      variables: { id, accept: false },
      refetchQueries: [{ query: GET_BETS }]
    });
  };
  const dateToString = time => {
    if (time) {
      return moment(time, "YYYY-MM-DD HH:mm:ss Z").format(
        "MMM Do YYYY, h:mm a"
      );
    } else {
      return "?";
    }
  };

  let rcptName = "*Anyone";
  if (recipient) {
    rcptName = `${recipient.name} (${recipient.userName})`;
    if (!recipient.Name && recipient.twitterUser) {
      rcptName = "@" + recipient.twitterUser.screenName;
    }
  }

  const title = `${proposer.name} (${proposer.userName})'s Bet with ${rcptName}`;

  const acceptable =
    betStatus === "Pending Approval" &&
    ((!proposerReplyFk && isProposer) || (!recipientReplyFk && isRecipient));
  const rejectable =
    betStatus === "Pending Approval" &&
    ((proposerReplyFk && isProposer) || (recipientReplyFk && isRecipient));
  let statusColor = "bg-yellow-200";
  if (betStatus === "Accepted") {
    statusColor = "bg-green-200";
  } else if (betStatus === "Declined" || betStatus === "Withdrawn") {
    statusColor = "bg-red-300";
  }

  const betClass = onClick
    ? "rounded-lg border-gray-500 mt-6 shadow-xl hover:bg-gray-100 cursor-pointer"
    : "rounded-lg border-gray-500 mt-6 shadow-xl";

  const statusClass = `section-subtitle ${statusColor} rounded border border-black p-1 my-4`;
  const created = dateToString(createdAt);
  const expires = dateToString(expiresAt);
  const finalized = dateToString(finalizedAt);

  return (
    <div id="bet" className={betClass} onClick={onClick}>
      <div className="section-title-wrapper">
        <h1 className="section-title">{title}</h1>
        {betResult && (
          <div className="flex flex-col text-center rounded bg-green-200 border border-black p-6 m-6">
            <div className="section-subject font-extrabold font-lg">
              Congrats {betResult.winner.getName}
            </div>
            <div className="section-subject font-xs">{betResult.response}</div>
          </div>
        )}
        <div className={statusClass}>Status: {betStatus}</div>
        <div>
          {acceptable && (
            <button
              id="accept-btn"
              className="section-subtitle hover:text-blue-500 bg-green-200 rounded border border-black p-1 mx-3"
              onClick={onAccept}
            >
              Accept
            </button>
          )}
          {rejectable && (
            <button
              id="reject-btn"
              className="section-subtitle hover:text-blue-500 bg-red-200 rounded border border-black p-1 mx-3 my-4"
              onClick={onDecline}
            >
              {isProposer ? "Withdraw" : "Decline"}
            </button>
          )}
        </div>
        <div className="section-subtitle flex-col text-center">
          <div>
            <b>CREATED:</b> {created}
          </div>
          <div>
            <b>EXPIRES:</b> {expires}
          </div>
          <div>
            <b>FINAL:</b> {finalized}
          </div>
        </div>
      </div>
      {equations.map((eq, i) => (
        <div key={i}>
          <Equation equation={eq} />
        </div>
      ))}
    </div>
  );
}

export function Equation({ equation }) {
  const { operator = {}, expressions = [] } = equation;
  const leftExpressions = expressions.filter(exp => exp.isLeft);
  const rightExpressions = expressions.filter(exp => !exp.isLeft);
  const lastLeft = leftExpressions[leftExpressions.length - 1];

  return (
    <div className="flex items-center content-center justify-center">
      <div className="flex flex-col lg:flex-row px-4 py-2 m-2">
        <div className="m-4">
          {leftExpressions.map((expr, i) => (
            <div key={"leftExpr" + i}>
              <Expression expression={expr} />
            </div>
          ))}
        </div>

        {!lastLeft?.rightExpressionValue && (
          <div className="m-4">
            <Operator operator={operator} />
          </div>
        )}

        {!lastLeft?.rightExpressionValue && (
          <div className="m-4">
            {rightExpressions.map((expr, i) => (
              <div key={"rightExpr" + i}>
                <Expression expression={expr} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function Expression({ expression }) {
  const { player, game, metric, value, team } = expression;
  const subject = player || team;

  if (!subject && value != null) {
    return (
      <div>
        <div className="fact-wrapper flex flex-col bg-gray-200">
          <div className="m-1">
            <StaticInput value={value} disabled={true} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="fact-wrapper">
        <Subject subject={subject} game={game} />
        <Metric metric={metric} />
      </div>
    </div>
  );
}

const ACCEPT_BET = gql`
  mutation acceptBet($id: ID!, $accept: Boolean!) {
    acceptBet(id: $id, accept: $accept)
  }
`;
