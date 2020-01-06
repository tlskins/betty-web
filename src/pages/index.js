import React, { Fragment } from "react";
import { Router } from "@reach/router";

import { BetForm } from "./betForm";
import { Chat } from "./chat";
import { PlayerSearch } from "./playerSearch";

export default function Pages() {
  return (
    <Fragment>
      <Router primary={false} component={Fragment}>
        <BetForm path="/" />
        <Chat path="/chat" />
      </Router>
    </Fragment>
  );
}
