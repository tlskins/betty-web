import React, { useReducer } from "react";
import { useMutation } from "@apollo/react-hooks";
import moment from "moment-timezone";
import gql from "graphql-tag";

import { Operator, Source, Metric } from "./bet";

const CREATE_BET = gql`
  mutation createBet($changes: BetChanges!) {
    createBet(changes: $changes) {
      id
      createdAt
      proposer {
        name
        screenName
      }
      recipient {
        name
        screenName
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

const initialState = { equations: [{ ...initialEquation }] };

const reducer = (state, action) => {
  console.log("reducer", state, action);
  switch (action.type) {
    case "addOperator": {
      const { operator, eqIdx } = action;
      const { equations } = state;
      const equation = { ...equations[eqIdx], operator };

      return {
        equations: [
          ...equations.slice(0, eqIdx),
          equation,
          ...equations.slice(eqIdx + 1)
        ]
      };
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
      const expression = expressions[exprIdx];

      return addExprIfComplete({
        equations: [
          ...equations.slice(0, eqIdx),
          {
            ...equation,
            expressions: [
              ...expressions.slice(0, exprIdx),
              { ...expression, player, game },
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
      const expression = expressions[exprIdx];

      return addExprIfComplete({
        equations: [
          ...equations.slice(0, eqIdx),
          {
            ...equation,
            expressions: [
              ...expressions.slice(0, exprIdx),
              { ...expression, metric },
              ...expressions.slice(exprIdx + 1)
            ]
          },
          ...equations.slice(eqIdx + 1)
        ]
      });
    }
    default:
      throw new Error("what's going on?");
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
  return player && game && metric;
};

const equationComplete = equation => {
  let [lComplete, rComplete] = [false, false];
  equation.expressions
    .filter(expr => expressionComplete(expr))
    .forEach(expr => {
      if (expr.isLeft) {
        lComplete = true;
      } else {
        rComplete = true;
      }
    });
  return lComplete && rComplete && equation.operator;
};

export function NewBet() {
  const [{ equations }, dispatch] = useReducer(reducer, initialState);
  const [createBet, _] = useMutation(CREATE_BET);
  const complete = equationComplete(equations[0]);

  const saveBet = () => {
    const changes = { equationsChanges: [] };
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
    createBet({ variables: { changes } });
  };

  console.log("bet equations", equations);
  return (
    <div className="fact-section">
      <div className="section-title-wrapper">
        <h1 className="section-title">Bet with ?</h1>
        <p className="section-subtitle">
          {moment().format("MMMM Do YYYY, h:mm:ss a")} | @?
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
            <NewEquation eqIdx={i} equation={eq} dispatch={dispatch} />
          </div>
        ))}
    </div>
  );
}

function NewEquation({ eqIdx, equation, dispatch }) {
  const { operator, expressions } = equation;
  const [leftExpressions, rightExpressions] = [[], []];
  expressions.forEach((expr, i) => {
    if (expr.isLeft) {
      leftExpressions.push([expr, i]);
    } else {
      rightExpressions.push([expr, i]);
    }
  });

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
      <Operator
        operator={operator}
        onSelect={operator =>
          dispatch({ type: "addOperator", operator, eqIdx })
        }
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
      </div>
    </div>
  );
}

export function Expression({ eqIdx, exprIdx, expression, dispatch }) {
  const complete = expressionComplete(expression);
  const { player, game, metric } = expression;

  const className = complete ? "fact-wrapper" : "fact-wrapper bg-gray-200";

  return (
    <div>
      <div className={className}>
        <Source
          player={player}
          game={game}
          onSelect={source =>
            dispatch({ type: "addSource", source, eqIdx, exprIdx })
          }
        />
        <Metric
          metric={metric}
          onSelect={metric =>
            dispatch({ type: "addMetric", metric, eqIdx, exprIdx })
          }
        />
      </div>
    </div>
  );
}
