import React, { Fragment } from "react";
import { Router } from "@reach/router";

import { PlayerSearch } from "./playerSearch";
import { Chat } from "./chat";

export default function Pages() {
  return (
    <Fragment>
      <Router primary={false} component={Fragment}>
        <PlayerSearch path="/" />
        <Chat path="/chat" />
      </Router>
    </Fragment>
  );
}
