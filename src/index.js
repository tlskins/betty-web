import React from "react";
import ReactDOM from "react-dom";

import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { HttpLink } from "apollo-link-http";
import { ApolloProvider } from "@apollo/react-hooks";
import { split } from "apollo-link";
import { WebSocketLink } from "apollo-link-ws";
import { getMainDefinition } from "apollo-utilities";

import config from "./config"
import Pages from "./pages";
import "./css/tailwind.css";
import "./css/styles.css";

config.setConfig( require( './config.json' ))

const wsLink = new WebSocketLink({
  uri: config.gqlWsUri,
  options: {
    reconnect: true
  }
});

const httpLink = new HttpLink({
  uri: config.gqlHttpUri,
  credentials: "include"
});

// depending on what kind of operation is being sent
const link = split(
  // split based on operation type
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query);
    return kind === "OperationDefinition" && operation === "subscription";
  },
  wsLink,
  httpLink
);

const apolloClient = new ApolloClient({
  link,
  cache: new InMemoryCache()
});

if (module.hot) {
  module.hot.accept("./pages", () => {
    const NextApp = require("./pages").default;
    render(<NextApp />);
  });
}

function render(component) {
  ReactDOM.render(
    <ApolloProvider client={apolloClient}>{component}</ApolloProvider>,
    document.getElementById("root")
  );
}

render(<Pages />);
