import React, { useReducer, useState } from "react";
import { useMutation } from "@apollo/react-hooks";
import moment from "moment-timezone";
import gql from "graphql-tag";

import { GET_BETS } from "../../pages/yourBets";
import { UserSearch } from "../userSearch";
import { Equation } from "./bet";


const CREATE_BET = gql`
  mutation createBet($changes: BetChanges!) {
    createBet(changes: $changes) {
      id
      createdAt
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

const initialExpression = {
  isLeft: true,
  player: undefined,
  game: undefined,
  metric: undefined
};

const initialEquation = {
  operator: undefined,
  expressions: [
    { ...initialExpression, isLeft: true },
    { ...initialExpression, isLeft: false }
  ]
};

const initialState = {
  recipient: undefined,
  equations: [{ ...initialEquation }]
};

const reducer = (state, action) => {
  switch (action.type) {
    case "addOperator": {
      const { operator, eqIdx } = action;
      const { equations } = state;

      return addExprIfComplete({
        ...state,
        equations: [
          ...equations.slice(0, eqIdx),
          { ...equations[eqIdx], operator },
          ...equations.slice(eqIdx + 1)
        ]
      });
    }
    case "addSource": {
      const {
        source: { player, game },
        eqIdx,
        exprIdx
      } = action;
      const { equations } = state;
      const equation = equations[eqIdx];
      const { expressions } = equation;

      return addExprIfComplete({
        ...state,
        equations: [
          ...equations.slice(0, eqIdx),
          {
            ...equation,
            expressions: [
              ...expressions.slice(0, exprIdx),
              { ...expressions[exprIdx], player, game },
              ...expressions.slice(exprIdx + 1)
            ]
          },
          ...equations.slice(eqIdx + 1)
        ]
      });
    }
    case "addMetric": {
      const { metric, eqIdx, exprIdx } = action;
      const { equations } = state;
      const equation = equations[eqIdx];
      const { expressions } = equation;

      return addExprIfComplete({
        ...state,
        equations: [
          ...equations.slice(0, eqIdx),
          {
            ...equation,
            expressions: [
              ...expressions.slice(0, exprIdx),
              { ...expressions[exprIdx], metric },
              ...expressions.slice(exprIdx + 1)
            ]
          },
          ...equations.slice(eqIdx + 1)
        ]
      });
    }
    case "addRecipient": {
      const { recipient } = action;
      return { ...state, recipient };
    }
    case "clearBet":
      return { ...initialState };
    default:
      throw new Error("undefined reducer action");
  }
};

const addExprIfComplete = state => {
  state.equations.forEach(eq => {
    let [lComplete, rComplete] = [true, true];
    eq.expressions
      .filter(expr => !expressionComplete(expr))
      .forEach(expr => {
        if (expr.isLeft) {
          lComplete = false;
        } else {
          rComplete = false;
        }
      });

    if (lComplete) {
      eq.expressions = [
        ...eq.expressions,
        { ...initialExpression, isLeft: true }
      ];
    }
    if (rComplete) {
      eq.expressions = [
        ...eq.expressions,
        { ...initialExpression, isLeft: false }
      ];
    }
  });

  return state;
};

const expressionComplete = expression => {
    const { player, game, metric } = expression;
    return player && game && metric ? true : false;
};
    
const equationComplete = equation => {
    const left = equation.expressions.filter(e => e.isLeft);
    const right = equation.expressions.filter(e => !e.isLeft);
    if (
    !equation.operator ||
    left.length === 0 ||
    right.length === 0 ||
    !expressionComplete(left[0]) ||
    !expressionComplete(right[0])
    ) {
    return false;
    }
    return true;
};

const betComplete = bet => {
    const { recipient, equations = [] } = bet;
    if (equations.length === 0) {
      return false;
    }
    if (!equationComplete(equations[0])) {
      return false;
    }
    return equations.length > 0 && recipient ? true : false;
  };

// components

export function NewBet({ setAlertMsg }) {
  const [{ recipient, equations }, dispatch] = useReducer(
    reducer,
    initialState
  );
  const [createBet] = useMutation(CREATE_BET, {
    onCompleted(data) {
      setAlertMsg("Bet sent!");
    }
  });
  const [findingUser, setFindingUser] = useState(false);
  const complete = betComplete({ recipient, equations });

  const saveBet = () => {
    const changes = {
      equationsChanges: [],
      betRecipient: {
        id: recipient.id,
        twitterScreenName:
          recipient.twitterUser && recipient.twitterUser.screenName
      }
    };
    equations.forEach(eq => {
      const eqChg = {
        operatorId: eq.operator.id,
        expressionChanges: []
      };
      eq.expressions.forEach(expr => {
        if (expressionComplete(expr)) {
          eqChg.expressionChanges.push({
            isLeft: expr.isLeft,
            playerFk: expr.player.fk,
            gameFk: expr.game.fk,
            metricId: expr.metric.id
          });
        }
      });
      changes.equationsChanges.push(eqChg);
    });
    createBet({
      variables: { changes },
      refetchQueries: [{ query: GET_BETS }]
    });
    dispatch({ type: "clearBet" });
  };

  const recipientName =
    (recipient &&
      (recipient.userName ||
        (recipient.twitterUser && "@" + recipient.twitterUser.screenName))) ||
    "?";
  const titleWrapperClass = findingUser
    ? "section-title-wrapper"
    : "section-title-wrapper inline-flex";

  return (
    <div className="fact-section">
      <div className={titleWrapperClass}>
        <h1 className="section-title">
          New Bet with
          {!findingUser && (
            <span
              className="underline hover:text-blue-500 cursor-pointer ml-2"
              onClick={() => setFindingUser(true)}
            >
              {recipientName}
            </span>
          )}
          {findingUser && (
            <div className="section-subtitle">
              <UserSearch
                onExit={() => setFindingUser(false)}
                onSelect={({ user: recipient }) =>
                  dispatch({ type: "addRecipient", recipient })
                }
              />
            </div>
          )}
        </h1>
        <p className="section-subtitle">
          {moment().format("MMMM Do YYYY, h:mm:ss a")}
        </p>
        {complete && (
          <p
            className="section-subtitle underline hover:text-blue-500 cursor-pointer"
            onClick={saveBet}
          >
            Propose
          </p>
        )}
      </div>
      {equations &&
        Object.values(equations).map((eq, i) => (
          <div key={i}>
            <Equation eqIdx={i} equation={eq} dispatch={dispatch} />
          </div>
        ))}
    </div>
  );
}
