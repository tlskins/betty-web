import React, { useState, useEffect, Fragment } from "react";
import { useQuery, useSubscription } from "@apollo/react-hooks";
import gql from "graphql-tag";
// import "typeface-roboto";
import { makeStyles } from "@material-ui/core/styles";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import NativeSelect from "@material-ui/core/NativeSelect";

import { PlayerSearch } from "./playerSearch";

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
    setEquation([...equation, expr]);
    const next = nextStep(step);
    setStep(next);
    if (next.num == 0) addToEqs();
  };

  const addToEqs = () => {
    setEquations([...equations, equation]);
    setEquation([]);
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

  if (list) {
    return (
      <BetSelector
        title={step.name}
        list={list}
        onSelect={expr => addToEq(expr)}
      />
    );
  } else if (step.name == "Choose Player / Team") {
    return <PlayerSearch onSelect={expr => addToEq(expr)} />;
  }

  return (
    <div>
      <h3>{step.name}</h3>
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
