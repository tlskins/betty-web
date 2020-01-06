import React, { useState, useEffect, Fragment } from "react";
import { useQuery, useSubscription } from "@apollo/react-hooks";
import gql from "graphql-tag";
import "typeface-roboto";
import { makeStyles } from "@material-ui/core/styles";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import NativeSelect from "@material-ui/core/NativeSelect";
import Chip from "@material-ui/core/Chip";
import FaceIcon from "@material-ui/icons/Face";

import { PlayerSearch } from "./playerSearch";
import { NavBar } from "./navBar";

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

function BetSelector({ title, list, onSelect }) {
  const classes = useStyles();
  //   const [value, setValue] = useState(list.length == 0 ? null : list[0]);

  return (
    <FormControl className={classes.formControl}>
      <NativeSelect
        // value={value}
        onChange={e => onSelect(e.target.value)}
        inputProps={{
          name: "age",
          id: "age-native-label-placeholder"
        }}
        autoFocus={true}
      >
        {list.map((v, i) => (
          <option key={i} value={v}>
            {v}
          </option>
        ))}
      </NativeSelect>
      {/* <FormHelperText>Label + placeholder</FormHelperText> */}
    </FormControl>
  );
}

export function BetForm() {
  const { loading, error, data } = useQuery(GET_SETTINGS, {
    variables: { id: "nfl" }
  });
  const [step, setStep] = useState(steps[0]);
  const [equations, setEquations] = useState([]);
  const [equation, setEquation] = useState([]);

  const nextStep = currStep => {
    if (currStep.num + 1 >= steps.length) {
      return steps[0];
    }
    return steps[currStep.num + 1];
  };

  const addToEq = expr => {
    const next = nextStep(step);
    if (next.num == 0) {
      setEquations([...equations, [...equation, expr]]);
      setEquation([]);
    } else {
      setEquation([...equation, expr]);
    }
    setStep(next);
  };

  if (loading) return <p>Loading ...</p>;
  if (error) return <p>Error {error.message}</p>;

  console.log("step", step);
  console.log("eqs", equations);
  console.log("eq", equation);

  const {
    leagueSettings: { playerBets, teamBets, betEquations }
  } = data;

  let list;
  if (step.name == "Choose Stat / Result") {
    list = playerBets.map(b => b.name);
  } else if (step.name == "Choose Comparison Type") {
    list = betEquations.map(b => b.name);
  }

  return (
    <div>
      <NavBar />
      <h3>Title: {step.name}</h3>
      <div>
        {equations.map((eq, i) => (
          <div key={i}>
            <Equation equation={eq} />
          </div>
        ))}
      </div>
      <div>
        <Equation equation={equation} />
      </div>
      {list ? (
        <BetSelector
          title={step.name}
          list={list}
          onSelect={expr => addToEq(expr)}
        />
      ) : (
        <PlayerSearch onSelect={expr => addToEq(expr)} />
      )}
    </div>
  );
}
