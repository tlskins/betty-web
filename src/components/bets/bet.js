import React from "react";
import { useMutation } from "@apollo/react-hooks";
import moment from "moment-timezone";
import gql from "graphql-tag";

import { GET_BETS } from "../../pages/yourBets";
import { Operator } from "./operator";
import { Source } from "./source";
import { Metric } from "./metric";

const ACCEPT_BET = gql`
  mutation acceptBet($id: ID!, $accept: Boolean!) {
    acceptBet(id: $id, accept: $accept)
  }
`;

export function Bet({ bet, onClick, setAlertMsg }) {
  const {
    id,
    createdAt,
    finalizedAt,
    expiresAt,
    betStatus,
    equations,
    proposer,
    recipient,
    proposerReplyFk,
    recipientReplyFk
  } = bet;
  const profile = JSON.parse(localStorage.getItem("profile"));
  const isProposer = profile && proposer.id === profile.id;
  const isRecipient = profile && recipient.id === profile.id;

  const [acceptBet] = useMutation(ACCEPT_BET, {
    onCompleted(data) {
      setAlertMsg("Bet Accepted!");
    }
  });
  const [rejectBet] = useMutation(ACCEPT_BET, {
    onCompleted(data) {
      setAlertMsg(`Bet ${isProposer ? "Withdrawn" : "Declined"}!`);
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
    console.log(e);
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

  let rcptName = `${recipient.name} (${recipient.userName})`;
  if (!recipient.Name && recipient.twitterUser) {
    rcptName = "@" + recipient.twitterUser.screenName;
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
    ? "fact-section rounded-lg hover:bg-gray-100 cursor-pointer"
    : "fact-section rounded-lg";
  const statusClass = `section-subtitle ${statusColor} rounded border border-black p-1`;
  const created = dateToString(createdAt);
  const expires = dateToString(expiresAt);
  const finalized = dateToString(finalizedAt);

  return (
    <div id="bet" className={betClass} onClick={onClick}>
      <div className="section-title-wrapper">
        <h1 className="section-title">{title}</h1>
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
              className="section-subtitle hover:text-blue-500 bg-red-200 rounded border border-black p-1 mx-3"
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
      <hr className="article-divider" />
    </div>
  );
}

export function Equation({ eqIdx, equation, dispatch }) {
  const { operator = {}, expressions = [] } = equation;
  const [leftExpressions, rightExpressions] = [[], []];
  expressions &&
    expressions.forEach((expr, i) => {
      if (expr.isLeft) {
        leftExpressions.push([expr, i]);
      } else {
        rightExpressions.push([expr, i]);
      }
    });

  const onSelect =
    dispatch &&
    (operator => dispatch({ type: "addOperator", operator, eqIdx }));

  return (
    <div className="flex w-full">
      <div className="flex flex-col px-4 py-2 m-2 w-full">
        {leftExpressions.map(([expr, i]) => (
          <div key={i}>
            <Expression
              eqIdx={eqIdx}
              exprIdx={i}
              expression={expr}
              dispatch={dispatch}
            />
          </div>
        ))}
      </div>
      <Operator operator={operator} onSelect={onSelect} />
      <div className="flex flex-col px-4 py-2 m-2 w-full">
        {rightExpressions.map(([expr, i]) => (
          <div key={i}>
            <Expression
              eqIdx={eqIdx}
              exprIdx={i}
              expression={expr}
              dispatch={dispatch}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

const expressionComplete = expression => {
  const { player, game, metric } = expression;
  return player && game && metric ? true : false;
};

export function Expression({ eqIdx, exprIdx, expression, dispatch }) {
  const complete = expressionComplete(expression);
  const { player, game, metric } = expression;

  const onSelectSource =
    dispatch &&
    (source => dispatch({ type: "addSource", source, eqIdx, exprIdx }));
  const onSelectMetric =
    dispatch &&
    (metric => dispatch({ type: "addMetric", metric, eqIdx, exprIdx }));
  const className =
    complete || !dispatch ? "fact-wrapper" : "fact-wrapper bg-gray-200";

  return (
    <div>
      <div className={className}>
        <Source player={player} game={game} onSelect={onSelectSource} />
        <Metric metric={metric} onSelect={onSelectMetric} />
      </div>
    </div>
  );
}
