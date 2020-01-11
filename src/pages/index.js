import React, { Fragment } from "react";
import { Router } from "@reach/router";

import { YourBets } from "./yourBets";
import { Chat } from "./chat";

export default function Pages() {
  return (
    <Fragment>
      <Router primary={false} component={Fragment}>
        <YourBets path="/" />
        <Chat path="/chat" />
      </Router>
    </Fragment>
  );
}
