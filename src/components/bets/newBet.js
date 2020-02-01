import React, { useReducer } from "react";
import { useMutation } from "@apollo/react-hooks";
import moment from "moment-timezone";
import gql from "graphql-tag";

import { GET_BETS } from "../../pages/yourBets";
import { UserSearch } from "../userSearch";
import { OperatorSearch } from "./operator";
import { SubjectSearch } from "./subject";
import { MetricSelect } from "./metric";

const CREATE_BET = gql`
  mutation createBet($changes: NewBet!) {
    createBet(changes: $changes) {
      id
      createdAt
      betStatus
      proposer {
        name
        userName
      }
      recipient {
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
          ... on StaticExpression {
            id
            isLeft
            value
          }
          ... on PlayerExpression {
            id
            isLeft
            value
            player {
              id
              teamFk
              leagueId
              firstName
              lastName
              teamShort
              position
              updatedAt
            }
            game {
              id
              homeTeamFk
              homeTeamName
              awayTeamName
            }
            metric {
              name
            }
          }
          ... on TeamExpression {
            isLeft
            value
            team {
              id
              leagueId
              fk
              name
              url
              updatedAt
              shortName
              location
            }
            game {
              id
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
    case "addExpression": {
      const { isLeft, eqIdx } = action;
      const { equations } = state;

      return {
        ...state,
        equations: [
          ...equations.slice(0, eqIdx),
          {
            ...equations[eqIdx],
            expressions: [
              ...equations[eqIdx].expressions,
              { ...initialExpression, isLeft }
            ]
          },
          ...equations.slice(eqIdx + 1)
        ]
      };
    }
    case "addOperator": {
      const { operator, eqIdx } = action;
      const { equations } = state;

      return {
        ...state,
        equations: [
          ...equations.slice(0, eqIdx),
          { ...equations[eqIdx], operator },
          ...equations.slice(eqIdx + 1)
        ]
      };
    }
    case "addSubject": {
      const { subject, eqIdx, exprIdx } = action;
      const { equations } = state;
      const equation = equations[eqIdx];
      const { expressions } = equation;
      let newExpr = {
        ...expressions[exprIdx],
        subject: undefined,
        metric: undefined
      };
      if (subject && subject.player) {
        newExpr.player = { ...subject };
      } else if (subject && subject.team) {
        newExpr.team = { ...subject };
      }

      console.log("addsubject", action, newExpr);

      return {
        ...state,
        equations: [
          ...equations.slice(0, eqIdx),
          {
            ...equation,
            expressions: [
              ...expressions.slice(0, exprIdx),
              newExpr,
              ...expressions.slice(exprIdx + 1)
            ]
          },
          ...equations.slice(eqIdx + 1)
        ]
      };
    }
    case "addMetric": {
      const { metric, eqIdx, exprIdx } = action;
      const { equations } = state;
      const equation = equations[eqIdx];
      const { expressions } = equation;

      return {
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
      };
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

const expressionComplete = expression => {
  const { player, game, metric } = expression;
  return !!(player && game && metric) ? true : false;
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
    "";

  return (
    <div className="fact-section m-2">
      <div className="section-title-wrapper inline-flex">
        <h1 className="section-title">
          <div className="text-black font-serif">New Bet with</div>
          <div className="section-subtitle">
            <UserSearch
              value={recipientName}
              onSelect={({ user: recipient }) =>
                dispatch({ type: "addRecipient", recipient })
              }
              onClear={() =>
                dispatch({ type: "addRecipient", recipient: undefined })
              }
            />
          </div>
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
            <Equation eqIdx={i} equation={eq} dispatch={dispatch} focus={{}} />
          </div>
        ))}
    </div>
  );
}

export function Equation({ eqIdx, equation, dispatch, focus }) {
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

  const addLeft = expressionComplete(
    leftExpressions[leftExpressions.length - 1][0]
  );
  const addRight = expressionComplete(
    rightExpressions[rightExpressions.length - 1][0]
  );

  const onSelect = operator =>
    dispatch({ type: "addOperator", operator, eqIdx });
  const onClear = () =>
    dispatch({ type: "addOperator", operator: undefined, eqIdx });

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
              focus={focus && focus["l" + i]}
            />
          </div>
        ))}
        {addLeft && (
          <button
            className="bg-indigo-800 text-white font-serif mt-2 p-2 rounded"
            onClick={() =>
              dispatch({ type: "addExpression", isLeft: true, eqIdx })
            }
          >
            Add Player
          </button>
        )}
      </div>
      <OperatorSearch
        operator={operator}
        onSelect={onSelect}
        onClear={onClear}
      />
      <div className="flex flex-col px-4 py-2 m-2 w-full">
        {rightExpressions.map(([expr, i]) => (
          <div key={i}>
            <Expression
              eqIdx={eqIdx}
              exprIdx={i}
              expression={expr}
              dispatch={dispatch}
              focus={focus && focus["r" + i]}
            />
          </div>
        ))}
        {addRight && (
          <button
            className="bg-indigo-800 text-white font-serif mt-2 p-2 rounded"
            onClick={() =>
              dispatch({ type: "addExpression", isLeft: false, eqIdx })
            }
          >
            Add Player
          </button>
        )}
      </div>
    </div>
  );
}

export function Expression({ eqIdx, exprIdx, expression, dispatch }) {
  const { player, team, metric = {} } = expression;

  console.log("expression", expression);

  const onSelectSubject = subject =>
    dispatch({ type: "addSubject", subject, eqIdx, exprIdx });
  const onSelectMetric = metric =>
    dispatch({ type: "addMetric", metric, eqIdx, exprIdx });
  const onClearSubject = () => {
    dispatch({
      type: "addSubject",
      subject: undefined,
      eqIdx,
      exprIdx
    });
  };
  const onClearMetric = () =>
    dispatch({ type: "addMetric", metric: undefined, eqIdx, exprIdx });

  return (
    <div>
      <div className="fact-wrapper flex flex-col bg-gray-200">
        <div className="m-1">
          <SubjectSearch
            subject={player || team}
            onSelect={subject => onSelectSubject(subject)}
            onClear={onClearSubject}
          />
        </div>
        <div className="m-1">
          <MetricSelect
            metric={metric}
            onSelect={onSelectMetric}
            onClear={onClearMetric}
          />
        </div>
      </div>
    </div>
  );
}
