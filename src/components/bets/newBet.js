import React, { useReducer, Fragment } from "react";
import { useMutation, useQuery } from "@apollo/react-hooks";
import moment from "moment-timezone";
import gql from "graphql-tag";

import { GET_BETS } from "../../pages/yourBets";
import { GET_BET_MAPS } from "../../components/bets/metric";
import { UserSearch } from "../userSearch";
import { OperatorSearch } from "./operator";
import { SubjectSearch } from "./subject";
import { MetricSelect } from "./metric";
import { StaticInput } from "./static";

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
  leagueId: undefined,
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
      const { eqIdx, exprIdx, type, ...subject } = action;

      const { equations } = state;
      const equation = equations[eqIdx];
      const { expressions } = equation;

      return {
        ...state,
        leagueId: subject?.game?.leagueId,
        equations: [
          ...equations.slice(0, eqIdx),
          {
            ...equation,
            expressions: [
              ...expressions.slice(0, exprIdx),
              {
                ...expressions[exprIdx],
                metric: undefined,
                ...subject
              },
              ...expressions.slice(exprIdx + 1)
            ]
          },
          ...equations.slice(eqIdx + 1)
        ]
      };
    }
    case "addMetric": {
      const { metric, eqIdx, exprIdx, operators } = action;
      const { equations } = state;
      const equation = equations[eqIdx];
      const { expressions } = equation;

      const newEq = {
        ...equation,
        expressions: [
          ...expressions.slice(0, exprIdx),
          { ...expressions[exprIdx], metric },
          ...expressions.slice(exprIdx + 1)
        ]
      };

      // add metric dependencies
      if (metric && metric.operatorId) {
        const operator = operators.find(op => op.id === metric.operatorId);
        newEq.operator = operator;
      }
      if (metric && metric.rightExpressionValue != null) {
        const firstRight = newEq.expressions.findIndex(exp => !exp.isLeft);
        newEq.expressions = [
          ...newEq.expressions.slice(0, firstRight),
          {
            ...initialExpression,
            value: metric.rightExpressionValue,
            isLeft: false
          },
          ...newEq.expressions.slice(firstRight + 1)
        ];
      }
      if (metric && metric.rightExpressionTypes?.includes("Static")) {
        const firstRight = newEq.expressions.findIndex(exp => !exp.isLeft);
        newEq.expressions = [
          ...newEq.expressions.slice(0, firstRight),
          {
            ...initialExpression,
            value: 0,
            isLeft: false
          },
          ...newEq.expressions.slice(firstRight + 1)
        ];
      }
      // reverse old metric dependencies when clearing metric
      if (!metric) {
        const oldMetric = expressions[exprIdx].metric;
        if (oldMetric) {
          if (oldMetric.operatorId) {
            newEq.operator = undefined;
          }
          if (oldMetric.rightExpressionValue) {
            const firstRight = newEq.expressions.findIndex(exp => !exp.isLeft);
            newEq.expressions = [
              ...newEq.expressions.slice(0, firstRight),
              { ...initialExpression, isLeft: false },
              ...newEq.expressions.slice(firstRight + 1)
            ];
          }
        }
      }

      return {
        ...state,
        equations: [
          ...equations.slice(0, eqIdx),
          newEq,
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
  const { player, game, team, metric, value } = expression;
  return value != null || (player && game && metric) || (team && game && metric)
    ? true
    : false;
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
  const [{ recipient, equations, leagueId }, dispatch] = useReducer(
    reducer,
    initialState
  );
  const [createBet] = useMutation(CREATE_BET, {
    onCompleted(data) {
      // setAlertMsg("Bet sent!");
    }
  });
  const complete = betComplete({ recipient, equations });

  console.log("leagueId", leagueId);

  const saveBet = () => {
    const changes = {
      leagueId,
      betRecipient: {
        userId: recipient.id,
        twitterScreenName: recipient?.twitterUser?.screenName
      },
      newEquations: equations.map(eq => {
        return {
          operatorId: eq.operator.id,
          newExpressions: eq.expressions.map(exp => {
            const newExp = { isLeft: exp.isLeft };
            if (exp.player?.id) {
              newExp.playerId = exp.player.id;
            }
            if (exp.team?.id) {
              newExp.teamId = exp.team.id;
            }
            if (exp.value != null) {
              newExp.value = exp.value;
            }
            if (exp.metric?.id) {
              newExp.metricId = exp.metric.id;
            }
            if (exp.game?.id) {
              newExp.gameId = exp.game.id;
            }
            return newExp;
          })
        };
      })
    };

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
            <Equation eqIdx={i} equation={eq} dispatch={dispatch} />
          </div>
        ))}
    </div>
  );
}

export function Equation({ eqIdx, equation, dispatch }) {
  const { operator = {}, expressions = [] } = equation;
  const leftExpressions = expressions
    .map((exp, i) => [exp, i])
    .filter(expArr => expArr[0].isLeft);
  const rightExpressions = expressions
    .map((exp, i) => [exp, i])
    .filter(expArr => !expArr[0].isLeft);
  const lstLft = leftExpressions[leftExpressions.length - 1][0];
  const lstRgt = rightExpressions[rightExpressions.length - 1][0];
  const addLeft = expressionComplete(lstLft) && !lstLft?.metric?.leftOnly;
  const addRight = expressionComplete(lstRgt) && !lstLft?.metric?.leftOnly;
  const hideRight = lstLft?.metric?.rightExpressionValue != null;

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
      {!hideRight && (
        <Fragment>
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
        </Fragment>
      )}
    </div>
  );
}

export function Expression({ eqIdx, exprIdx, expression, dispatch }) {
  const { data } = useQuery(GET_BET_MAPS, {
    variables: { betType: "Operator" }
  });
  const { player, team, game, value, metric = {} } = expression;
  const subject = player || team;
  const operators = data?.getBetMaps || [];

  if (!subject && value != null) {
    const onSelect = staticValue =>
      dispatch({
        type: "addSubject",
        eqIdx,
        exprIdx,
        value: staticValue
      });
    const onClear = () =>
      dispatch({
        type: "addSubject",
        eqIdx,
        exprIdx,
        value: undefined
      });

    return (
      <div>
        <div className="fact-wrapper flex flex-col bg-gray-200">
          <div className="m-1">
            <StaticInput value={value} onSelect={onSelect} onClear={onClear} />
          </div>
        </div>
      </div>
    );
  }

  const onSelectSubject = subject =>
    dispatch({ type: "addSubject", eqIdx, exprIdx, ...subject });

  const onSelectMetric = metric =>
    dispatch({ type: "addMetric", eqIdx, exprIdx, operators, metric });

  return (
    <div>
      <div className="fact-wrapper flex flex-col bg-gray-200">
        <div className="m-1">
          <SubjectSearch
            subject={subject}
            game={game}
            onSelect={onSelectSubject}
          />
        </div>
        <div className="m-1">
          <MetricSelect
            subject={subject}
            metric={metric}
            onSelect={onSelectMetric}
          />
        </div>
      </div>
    </div>
  );
}
