import React, { Fragment } from "react";
import { Router } from "@reach/router";

import { PlayerSearch } from "./playerSearch";

export default function Pages() {
  return (
    <Fragment>
      <Router primary={false} component={Fragment}>
        <PlayerSearch path="/" />
      </Router>
    </Fragment>
  );
}
