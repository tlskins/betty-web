import React, { Fragment } from "react";
import { Router } from "@reach/router";

import { YourBets } from "./yourBets";
import { BrowseBets } from "./browseBets";
import { BetDetail } from "./betDetail";
import { Info } from "./info";
import { SignIn } from "./signIn";
import { Chat } from "../components/chat";

export default function Pages() {
  return (
    <Fragment>
      <Router primary={false} component={Fragment}>
        <BrowseBets path="/" />
        <YourBets path="/bets" />
        <Chat path="/chat" />
        <SignIn path="/login" />
        <Info path="/info" />
        <BetDetail path="/bet/:betId" />
      </Router>
    </Fragment>
  );
}
