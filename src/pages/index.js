import React, { Fragment } from "react";
import { Router } from "@reach/router";

import Players from "./players";

export default function Pages() {
  return (
    <Fragment>
      <Router primary={false} component={Fragment}>
        <Players path="/" />
      </Router>
    </Fragment>
  );
}
